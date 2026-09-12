/**
 * Browser-side helpers for the admin page. Kept free of React and of direct
 * `window` access so they can be unit-tested in Node: `fetch` and the
 * storage are passed in.
 */

export const SECRET_STORAGE_KEY = 'ideas.postSecret'

/** Mirrors the body parser limit on `POST /api/ideas`. */
export const MAX_BODY_BYTES = 20 * 1024

export const POST_IDEA_PATH = '/api/ideas'
export const SNAPSHOT_PATH = '/api/ideas/snapshot'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<Pick<Response, 'ok' | 'status' | 'json' | 'text'>>

export function readSecret(
  storage: StorageLike | undefined
): string | undefined {
  if (!storage) {
    return undefined
  }
  try {
    const value = storage.getItem(SECRET_STORAGE_KEY)
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

/** UTF-8 size of the Markdown body, shown next to the 20 KB limit. */
export function bodyByteLength(body: string): number {
  return new TextEncoder().encode(body).length
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
    bodyByteLength(input.body) <= MAX_BODY_BYTES
  )
}

export function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return '秘密が違います。保存し直してください。'
    case 400:
      return '本文が空か、形式が正しくありません。'
    case 413:
      return '本文が 20 KB を超えています。'
    case 415:
      return 'リクエストの形式が正しくありません。'
    case 500:
      return '保存に失敗しました。時間をおいて再試行してください。'
    default:
      return `送信に失敗しました（HTTP ${status}）。`
  }
}

export const NETWORK_ERROR_MESSAGE =
  '通信に失敗しました。接続を確認してください。'

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
      body: JSON.stringify({ body }),
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
    return { ok: false, message: '応答を読み取れませんでした。' }
  }
  if (!isPostIdeaSuccess(payload)) {
    return { ok: false, message: '応答を読み取れませんでした。' }
  }
  return {
    ok: true,
    id: payload.id,
    createdAt: payload.createdAt,
    revalidated: payload.revalidated,
  }
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
    return { ok: false, message: '応答を読み取れませんでした。' }
  }
}
