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
 * Retention policy. Every save adds a snapshot, so without pruning the store
 * grows forever. Older snapshots are only history, but a few are kept as a
 * safety net against data loss on the store's side:
 *
 * - the newest `keepAlways` snapshots are never deleted;
 * - beyond those, a snapshot is deleted once it is at least `maxAgeMs` old
 *   or falls outside the newest `keepRecent`.
 */
export type RetentionPolicy = {
  keepAlways: number
  keepRecent: number
  maxAgeMs: number
}

export const SNAPSHOT_RETENTION: RetentionPolicy = {
  keepAlways: 5,
  keepRecent: 30,
  // "One month", taken as 30 days.
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
}

const SNAPSHOT_PATHNAME = /^ideas\/[^/]+\.json$/

const SNAPSHOT_TIMESTAMP =
  /^ideas\/(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2}\.\d{3})Z\.json$/

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
 * Recovers the time a snapshot was taken from its pathname (the inverse of
 * `snapshotPathname`). Returns `undefined` for anything else.
 */
export function snapshotTimestamp(pathname: string): number | undefined {
  const match = SNAPSHOT_TIMESTAMP.exec(pathname)
  if (!match) {
    return undefined
  }
  const time = Date.parse(`${match[1]}T${match[2]}:${match[3]}:${match[4]}Z`)
  return Number.isNaN(time) ? undefined : time
}

/**
 * Picks the snapshots the policy no longer keeps, oldest first. Only
 * pathnames that `snapshotTimestamp` understands are considered, so
 * unrelated objects under the prefix are never returned. `keepAlways` is
 * clamped to at least 1 so the newest snapshot can never be selected.
 */
export function selectStaleSnapshots<T extends { pathname: string }>(
  blobs: T[],
  now: Date,
  policy: RetentionPolicy = SNAPSHOT_RETENTION
): T[] {
  const keepAlways = Math.max(1, Math.floor(policy.keepAlways))
  // No need to clamp keepRecent against keepAlways: the keepAlways check
  // below runs first, so a smaller keepRecent cannot reach those ranks.
  const keepRecent = Math.floor(policy.keepRecent)
  const cutoff = now.getTime() - policy.maxAgeMs
  const snapshots = blobs
    .map((blob) => ({ blob, time: snapshotTimestamp(blob.pathname) }))
    .filter(
      (entry): entry is { blob: T; time: number } => entry.time !== undefined
    )
    .sort((a, b) => b.time - a.time)
  return snapshots
    .filter((entry, rank) => {
      if (rank < keepAlways) {
        return false
      }
      return rank >= keepRecent || entry.time <= cutoff
    })
    .map((entry) => entry.blob)
    .reverse()
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
 * Deletes the snapshots the policy no longer keeps and returns their
 * pathnames. Meant to run right after a successful `saveSnapshot`. Failures
 * propagate; callers decide whether they matter. Without a token there is
 * nothing to prune.
 */
export async function pruneSnapshots(
  now: Date = new Date(),
  policy: RetentionPolicy = SNAPSHOT_RETENTION
): Promise<string[]> {
  if (!blobToken()) {
    return []
  }
  const stale = selectStaleSnapshots(await listSnapshots(), now, policy)
  if (stale.length === 0) {
    return []
  }
  await del(stale.map((blob) => blob.url))
  return stale.map((blob) => blob.pathname)
}
