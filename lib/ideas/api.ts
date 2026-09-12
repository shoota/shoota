import type { NextApiRequest, NextApiResponse } from 'next'

import { isAuthorized } from '@/lib/ideas/auth'
import { generateIdeaId } from '@/lib/ideas/id'
import { loadLatest, saveSnapshot } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'

export const IDEAS_PATH = '/ideas'

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
 * POST /api/ideas — appends one idea to the latest snapshot and regenerates
 * the feed. Only the write path is authenticated; reads stay public.
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
    await saveSnapshot([...ideas, idea], now)
  } catch (error) {
    console.error('ideas: failed to save snapshot', errorName(error))
    res.status(500).json({ error: 'internal' })
    return
  }

  // The idea is durable at this point. If regeneration fails the ISR
  // fallback picks it up within the hour, so report success either way.
  let revalidated = true
  try {
    await res.revalidate(IDEAS_PATH)
  } catch (error) {
    revalidated = false
    console.error('ideas: failed to revalidate feed', errorName(error))
  }

  res.status(201).json({ id: idea.id, createdAt: idea.createdAt, revalidated })
}
