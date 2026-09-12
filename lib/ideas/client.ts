/**
 * Browser-side helpers for the admin page. Kept free of React and of direct
 * `window` access so they can be unit-tested in Node: `fetch` and the
 * storage are passed in.
 */

import { Idea, isIdea } from '@/lib/ideas/types'

export const SECRET_STORAGE_KEY = 'ideas.postSecret'

/**
 * Mirrors the body parser limit on `POST /api/ideas`. The limit applies to
 * the JSON request body, so it is compared against `requestByteLength`, not
 * the raw Markdown.
 */
export const MAX_BODY_BYTES = 20 * 1024

export const POST_IDEA_PATH = '/api/ideas'
export const SNAPSHOT_PATH = '/api/ideas/snapshot'

/** Path of the edit/delete endpoint for one idea. */
export function ideaApiPath(id: string): string {
  return `${POST_IDEA_PATH}/${encodeURIComponent(id)}`
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<Pick<Response, 'ok' | 'status' | 'json' | 'text'>>

const UNREADABLE_RESPONSE_MESSAGE = '応答を読み取れませんでした。'

export const NETWORK_ERROR_MESSAGE =
  '通信に失敗しました。接続を確認してください。'

export function readSecret(
  storage: StorageLike | undefined
): string | undefined {
  if (!storage) {
    return undefined
  }
  try {
    const value = storage.getItem(SECRET_STORAGE_KEY)?.trim()
    return value && value.length > 0 ? value : undefined
  } catch {
    return undefined
  }
}

/** Stores the trimmed secret. An empty value clears it instead. */
export function writeSecret(
  storage: StorageLike | undefined,
  secret: string
): string | undefined {
  const trimmed = secret.trim()
  if (!storage) {
    return undefined
  }
  try {
    if (trimmed.length === 0) {
      storage.removeItem(SECRET_STORAGE_KEY)
      return undefined
    }
    storage.setItem(SECRET_STORAGE_KEY, trimmed)
    return trimmed
  } catch {
    return undefined
  }
}

export function clearSecret(storage: StorageLike | undefined): void {
  try {
    storage?.removeItem(SECRET_STORAGE_KEY)
  } catch {
    // Storage may be unavailable (private mode, disabled). Nothing to clear.
  }
}

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

function requestBody(body: string): string {
  return JSON.stringify({ body })
}

/**
 * Size of the JSON request the browser will send, which is what the server's
 * 20 KB limit measures. JSON escaping makes this larger than the raw text.
 */
export function requestByteLength(body: string): number {
  return utf8ByteLength(requestBody(body))
}

export function canSubmit(input: {
  secret: string | undefined
  body: string
  busy: boolean
}): boolean {
  return (
    !input.busy &&
    input.secret !== undefined &&
    input.secret.length > 0 &&
    input.body.trim().length > 0 &&
    requestByteLength(input.body) <= MAX_BODY_BYTES
  )
}

export function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return '秘密が違います。保存し直してください。'
    case 400:
      return '本文が空か、形式が正しくありません。'
    case 404:
      return 'そのアイデアは見つかりません。一覧を読み込み直してください。'
    case 413:
      return '本文が 20 KB を超えています。'
    case 415:
      return 'リクエストの形式が正しくありません。'
    case 500:
      return 'サーバーでエラーが起きました。時間をおいて再試行してください。'
    default:
      return `失敗しました（HTTP ${status}）。`
  }
}

export type PostIdeaResult =
  | { ok: true; id: string; createdAt: string; revalidated: boolean }
  | { ok: false; message: string }

function isPostIdeaSuccess(
  value: unknown
): value is { id: string; createdAt: string; revalidated: boolean } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.revalidated === 'boolean'
  )
}

export async function postIdea(
  secret: string,
  body: string,
  fetchImpl: FetchLike
): Promise<PostIdeaResult> {
  let response: Awaited<ReturnType<FetchLike>>
  try {
    response = await fetchImpl(POST_IDEA_PATH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: requestBody(body),
    })
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  }
  if (!response.ok) {
    return { ok: false, message: messageForStatus(response.status) }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  if (!isPostIdeaSuccess(payload)) {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  return {
    ok: true,
    id: payload.id,
    createdAt: payload.createdAt,
    revalidated: payload.revalidated,
  }
}

export type UpdateIdeaResult =
  | { ok: true; id: string; updatedAt: string; revalidated: boolean }
  | { ok: false; message: string }

function isUpdateIdeaSuccess(
  value: unknown
): value is { id: string; updatedAt: string; revalidated: boolean } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.updatedAt === 'string' &&
    typeof record.revalidated === 'boolean'
  )
}

/**
 * Replaces the body of one idea. The request is the same `{ body }` JSON as
 * `postIdea`, so `requestByteLength` measures it exactly and the client-side
 * 20 KB check stays in step with the server's 413.
 */
export async function updateIdea(
  secret: string,
  id: string,
  body: string,
  fetchImpl: FetchLike
): Promise<UpdateIdeaResult> {
  let response: Awaited<ReturnType<FetchLike>>
  try {
    response = await fetchImpl(ideaApiPath(id), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: requestBody(body),
    })
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  }
  if (!response.ok) {
    return { ok: false, message: messageForStatus(response.status) }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  if (!isUpdateIdeaSuccess(payload)) {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  return {
    ok: true,
    id: payload.id,
    updatedAt: payload.updatedAt,
    revalidated: payload.revalidated,
  }
}

export type DeleteIdeaResult =
  | { ok: true; id: string; revalidated: boolean }
  | { ok: false; message: string }

function isDeleteIdeaSuccess(
  value: unknown
): value is { id: string; revalidated: boolean } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' && typeof record.revalidated === 'boolean'
  )
}

export async function deleteIdea(
  secret: string,
  id: string,
  fetchImpl: FetchLike
): Promise<DeleteIdeaResult> {
  let response: Awaited<ReturnType<FetchLike>>
  try {
    response = await fetchImpl(ideaApiPath(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secret}` },
    })
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  }
  if (!response.ok) {
    return { ok: false, message: messageForStatus(response.status) }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  if (!isDeleteIdeaSuccess(payload)) {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  return { ok: true, id: payload.id, revalidated: payload.revalidated }
}

export type IdeaListResult =
  | { ok: true; ideas: Idea[] }
  | { ok: false; message: string }

/**
 * Loads the ideas for the admin list through the authenticated snapshot
 * endpoint (there is no public read API). Entries that are not ideas are
 * dropped, and the result is ordered newest first like the feed.
 */
export async function fetchIdeas(
  secret: string,
  fetchImpl: FetchLike
): Promise<IdeaListResult> {
  let response: Awaited<ReturnType<FetchLike>>
  try {
    response = await fetchImpl(SNAPSHOT_PATH, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    })
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  }
  if (!response.ok) {
    return { ok: false, message: messageForStatus(response.status) }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  if (!Array.isArray(payload)) {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
  const ideas = payload
    .filter(isIdea)
    .sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
    )
  return { ok: true, ideas }
}

export type SnapshotResult =
  | { ok: true; json: string; filename: string }
  | { ok: false; message: string }

export function snapshotFilename(now: Date): string {
  return `ideas-${now.toISOString().replace(/[-:.]/g, '')}.json`
}

export async function fetchSnapshot(
  secret: string,
  fetchImpl: FetchLike,
  now: Date = new Date()
): Promise<SnapshotResult> {
  let response: Awaited<ReturnType<FetchLike>>
  try {
    response = await fetchImpl(SNAPSHOT_PATH, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    })
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE }
  }
  if (!response.ok) {
    return { ok: false, message: messageForStatus(response.status) }
  }
  try {
    return {
      ok: true,
      json: await response.text(),
      filename: snapshotFilename(now),
    }
  } catch {
    return { ok: false, message: UNREADABLE_RESPONSE_MESSAGE }
  }
}
