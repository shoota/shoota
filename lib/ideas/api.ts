import type { NextApiRequest, NextApiResponse } from 'next'

import { isAuthorized } from '@/lib/ideas/auth'
import { IDEAS_PATH, ideaPath } from '@/lib/ideas/detail'
import { generateIdeaId, isIdeaId } from '@/lib/ideas/id'
import { loadLatest, pruneSnapshots, saveSnapshot } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'

/** Response body of `POST /api/ideas`. Errors carry a short code only. */
export type PostIdeaResponse =
  | { id: string; createdAt: string; revalidated: boolean }
  | { error: string }

function mediaType(header: string | string[] | undefined): string {
  const value = Array.isArray(header) ? header[0] : header
  return (value ?? '').split(';')[0].trim().toLowerCase()
}

function readBody(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }
  const body = (payload as Record<string, unknown>).body
  if (typeof body !== 'string' || body.trim().length === 0) {
    return undefined
  }
  return body
}

/** Logs must not carry the message (it may quote input) or a stack trace. */
function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError'
}

/**
 * Reads an `If-Match` precondition. The admin page sends the `updatedAt` it
 * last saw as a quoted entity tag; the write is refused with 412 when the
 * idea has changed since. Absent header means no check (curl users).
 * Returns `null` when the header is present but not a single quoted tag.
 */
function readIfMatch(
  header: string | string[] | undefined
): string | undefined | null {
  if (header === undefined) {
    return undefined
  }
  const value = Array.isArray(header) ? header.join(',') : header
  const match = /^\s*(?:W\/)?"([^"]*)"\s*$/.exec(value)
  return match ? match[1] : null
}

/**
 * Saves a snapshot and then trims the store to its retention limit. Pruning
 * runs only after the save succeeded, and a pruning failure is logged
 * rather than thrown: the new snapshot is already durable, so the request
 * is a success either way and the next save gets another chance to prune.
 */
async function saveAndPrune(ideas: Idea[], now: Date): Promise<void> {
  await saveSnapshot(ideas, now)
  try {
    await pruneSnapshots()
  } catch (error) {
    console.error('ideas: failed to prune snapshots', errorName(error))
  }
}

/**
 * Regenerates each path on its own so a failure on one does not skip the
 * others. Returns false when any of them failed; the data is already durable
 * at that point and the ISR fallback catches up within the hour.
 */
async function revalidateAll(
  res: NextApiResponse,
  paths: string[]
): Promise<boolean> {
  let revalidated = true
  for (const path of paths) {
    try {
      await res.revalidate(path)
    } catch (error) {
      revalidated = false
      console.error('ideas: failed to revalidate', path, errorName(error))
    }
  }
  return revalidated
}

/**
 * POST /api/ideas — appends one idea to the latest snapshot and regenerates
 * the feed and the new idea's detail page. Only the write path is
 * authenticated; reads stay public.
 *
 * Within the handler the method and the shared secret are checked before the
 * request body is looked at, and `res.revalidate()` runs only after a
 * successful save. Errors never echo the request or a stack trace.
 *
 * Next.js parses the JSON body before the handler runs, so malformed JSON
 * (400) and bodies over the 20 KB limit (413) are rejected upstream, ahead of
 * the 401 check. The limit lives in the route file's `config` export because
 * Next.js requires that object to be a literal.
 */
export async function handlePostIdea(
  req: NextApiRequest,
  res: NextApiResponse<PostIdeaResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!isAuthorized(req.headers.authorization, process.env.IDEAS_POST_SECRET)) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  if (mediaType(req.headers['content-type']) !== 'application/json') {
    res.status(415).json({ error: 'unsupported_media_type' })
    return
  }

  const body = readBody(req.body)
  if (body === undefined) {
    res.status(400).json({ error: 'body_required' })
    return
  }

  const now = new Date()
  const idea: Idea = {
    id: generateIdeaId(now),
    body,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  try {
    const ideas = await loadLatest()
    await saveAndPrune([...ideas, idea], now)
  } catch (error) {
    console.error('ideas: failed to save snapshot', errorName(error))
    res.status(500).json({ error: 'internal' })
    return
  }

  // The idea is durable at this point, so report success either way. The
  // detail path is revalidated too, because ISR caches a 404 for an id that
  // was requested before it existed.
  const revalidated = await revalidateAll(res, [IDEAS_PATH, ideaPath(idea.id)])

  res.status(201).json({ id: idea.id, createdAt: idea.createdAt, revalidated })
}

export type PutIdeaResponse =
  | { id: string; updatedAt: string; revalidated: boolean }
  | { error: string }

export type DeleteIdeaResponse =
  | { id: string; revalidated: boolean }
  | { error: string }

/** Response body of `/api/ideas/[id]`; the shape depends on the method. */
export type IdeaByIdResponse = PutIdeaResponse | DeleteIdeaResponse

/**
 * PUT and DELETE `/api/ideas/[id]` — edits or removes one idea and regenerates
 * the feed and that idea's detail page (after a delete the detail page is
 * regenerated into a 404).
 *
 * The method and the shared secret are checked before the id, so an
 * unauthenticated caller learns nothing about which ids exist. The id must
 * pass `isIdeaId` before the store is read or a path is built from it; a
 * malformed id is a plain 404 without a Blob call. PUT replaces `body` and
 * `updatedAt` only; `id` and `createdAt` never change.
 *
 * Writes are read-modify-write on the whole snapshot and the store has no
 * compare-and-swap, so an optional `If-Match: "<updatedAt>"` precondition
 * lets a client refuse to overwrite an edit it has not seen (412). Two
 * writes racing within the same instant can still lose one of them; that
 * window is accepted for a single-user store.
 */
export async function handleIdeaById(
  req: NextApiRequest,
  res: NextApiResponse<IdeaByIdResponse>
): Promise<void> {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'PUT, DELETE')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!isAuthorized(req.headers.authorization, process.env.IDEAS_POST_SECRET)) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const id = req.query.id
  if (!isIdeaId(id)) {
    res.status(404).json({ error: 'not_found' })
    return
  }

  const expectedUpdatedAt = readIfMatch(req.headers['if-match'])
  if (expectedUpdatedAt === null) {
    res.status(400).json({ error: 'invalid_if_match' })
    return
  }

  const isDelete = req.method === 'DELETE'
  let body = ''
  if (!isDelete) {
    if (mediaType(req.headers['content-type']) !== 'application/json') {
      res.status(415).json({ error: 'unsupported_media_type' })
      return
    }
    const read = readBody(req.body)
    if (read === undefined) {
      res.status(400).json({ error: 'body_required' })
      return
    }
    body = read
  }

  const now = new Date()
  let updated: Idea | undefined
  try {
    const ideas = await loadLatest()
    const current = ideas.find((candidate) => candidate.id === id)
    if (current === undefined) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    if (
      expectedUpdatedAt !== undefined &&
      expectedUpdatedAt !== current.updatedAt
    ) {
      res.status(412).json({ error: 'precondition_failed' })
      return
    }
    let next: Idea[]
    if (isDelete) {
      next = ideas.filter((candidate) => candidate.id !== id)
    } else {
      const edited: Idea = { ...current, body, updatedAt: now.toISOString() }
      updated = edited
      next = ideas.map((candidate) =>
        candidate.id === id ? edited : candidate
      )
    }
    await saveAndPrune(next, now)
  } catch (error) {
    console.error('ideas: failed to save snapshot', errorName(error))
    res.status(500).json({ error: 'internal' })
    return
  }

  const revalidated = await revalidateAll(res, [IDEAS_PATH, ideaPath(id)])

  if (updated === undefined) {
    res.status(200).json({ id, revalidated })
    return
  }
  res.status(200).json({ id, updatedAt: updated.updatedAt, revalidated })
}

export type GetSnapshotResponse = Idea[] | { error: string }

/**
 * GET /api/ideas/snapshot — returns the latest snapshot for backup. The Blob
 * store is private, so the admin page cannot link to the blob directly and
 * downloads through this authenticated endpoint instead.
 */
export async function handleGetSnapshot(
  req: NextApiRequest,
  res: NextApiResponse<GetSnapshotResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!isAuthorized(req.headers.authorization, process.env.IDEAS_POST_SECRET)) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  let ideas: Idea[]
  try {
    ideas = await loadLatest()
  } catch (error) {
    console.error('ideas: failed to load snapshot', errorName(error))
    res.status(500).json({ error: 'internal' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ideas-${new Date().toISOString().replace(/[-:.]/g, '')}.json"`
  )
  res.status(200).json(ideas)
}
