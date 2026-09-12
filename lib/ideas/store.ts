import { del, get, list, put } from '@vercel/blob'

import { Idea, isIdea } from '@/lib/ideas/types'

/**
 * Ideas are stored on Vercel Blob as immutable snapshots. Every save writes a
 * new `ideas/<timestamp>.json` instead of overwriting, so the CDN cache never
 * serves stale content and the history doubles as a backup. Readers list the
 * prefix and pick the newest pathname.
 */
export const SNAPSHOT_PREFIX = 'ideas/'

/**
 * How many snapshots to keep. Every save adds one, so without a cap the
 * store grows forever and eats the free tier; older ones are only history.
 */
export const SNAPSHOT_RETENTION = 50

const SNAPSHOT_PATHNAME = /^ideas\/[^/]+\.json$/

type BlobAccess = 'public' | 'private'

function blobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return token && token.length > 0 ? token : undefined
}

/**
 * Vercel Blob stores are created as either public or private and the SDK
 * requires the matching `access` value on every call. The store type is not
 * discoverable from the token, so it is configured with `IDEAS_BLOB_ACCESS`.
 * Defaults to `private`.
 */
export function blobAccess(): BlobAccess {
  const value = process.env.IDEAS_BLOB_ACCESS
  if (value === undefined || value === '' || value === 'private') {
    return 'private'
  }
  if (value === 'public') {
    return 'public'
  }
  throw new Error('IDEAS_BLOB_ACCESS must be "public" or "private" when set')
}

/**
 * Builds the pathname for a snapshot taken at `now`. Colons are replaced with
 * hyphens so the pathname is safe in URLs while staying fixed-width, which
 * keeps lexicographic order equal to chronological order.
 */
export function snapshotPathname(now: Date): string {
  return `${SNAPSHOT_PREFIX}${now.toISOString().replace(/:/g, '-')}.json`
}

/**
 * Picks the newest snapshot from a list of blobs. Only pathnames shaped like
 * `ideas/<timestamp>.json` are considered so unrelated objects under the
 * prefix are ignored. Returns `undefined` when nothing matches.
 */
export function selectLatestSnapshot<T extends { pathname: string }>(
  blobs: T[]
): T | undefined {
  let latest: T | undefined
  for (const blob of blobs) {
    if (!SNAPSHOT_PATHNAME.test(blob.pathname)) {
      continue
    }
    if (latest === undefined || blob.pathname > latest.pathname) {
      latest = blob
    }
  }
  return latest
}

/**
 * Picks the snapshots that fall outside the newest `keep`, oldest first.
 * Uses the same pathname shape as `selectLatestSnapshot`, so unrelated
 * objects under the prefix are never returned. `keep` is clamped to at least
 * 1 so the newest snapshot can never be selected.
 */
export function selectStaleSnapshots<T extends { pathname: string }>(
  blobs: T[],
  keep: number = SNAPSHOT_RETENTION
): T[] {
  const retained = Math.max(1, Math.floor(keep))
  const snapshots = blobs
    .filter((blob) => SNAPSHOT_PATHNAME.test(blob.pathname))
    .sort((a, b) => (a.pathname < b.pathname ? -1 : 1))
  const excess = snapshots.length - retained
  return excess > 0 ? snapshots.slice(0, excess) : []
}

/**
 * Parses snapshot JSON. The snapshot is a plain array of ideas so it can be
 * placed by hand. Malformed entries are dropped rather than crashing render.
 */
export function parseSnapshot(json: string): Idea[] {
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed)) {
    throw new Error('Ideas snapshot must be a JSON array')
  }
  return parsed.filter(isIdea)
}

async function listSnapshots() {
  const blobs: { pathname: string; url: string }[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: SNAPSHOT_PREFIX, cursor, limit: 1000 })
    for (const blob of page.blobs) {
      blobs.push({ pathname: blob.pathname, url: blob.url })
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return blobs
}

/**
 * Loads the ideas from the newest snapshot. Returns an empty array when the
 * Blob token is not configured (for example on Preview builds) or when no
 * snapshot exists yet, so the page can always be built.
 */
export async function loadLatest(): Promise<Idea[]> {
  if (!blobToken()) {
    return []
  }
  const latest = selectLatestSnapshot(await listSnapshots())
  if (!latest) {
    return []
  }
  const result = await get(latest.url, {
    access: blobAccess(),
    useCache: false,
  })
  if (!result || result.stream === null) {
    return []
  }
  const json = await new Response(result.stream).text()
  return parseSnapshot(json)
}

/**
 * Writes a new snapshot containing `ideas` and returns its pathname. Requires
 * the Blob token; callers that can run without a store should check first.
 */
export async function saveSnapshot(
  ideas: Idea[],
  now: Date = new Date()
): Promise<string> {
  if (!blobToken()) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
  }
  const pathname = snapshotPathname(now)
  await put(pathname, JSON.stringify(ideas), {
    access: blobAccess(),
    contentType: 'application/json',
    addRandomSuffix: false,
  })
  return pathname
}

/**
 * Deletes snapshots beyond the newest `keep` and returns their pathnames.
 * Meant to run right after a successful `saveSnapshot`; the caller decides
 * what a failure means (the API logs it and still reports the save as a
 * success, because the new snapshot is already durable). Without a token
 * there is nothing to prune.
 */
export async function pruneSnapshots(
  keep: number = SNAPSHOT_RETENTION
): Promise<string[]> {
  if (!blobToken()) {
    return []
  }
  const stale = selectStaleSnapshots(await listSnapshots(), keep)
  if (stale.length === 0) {
    return []
  }
  await del(stale.map((blob) => blob.url))
  return stale.map((blob) => blob.pathname)
}
