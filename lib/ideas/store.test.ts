import { del, get, list, put } from '@vercel/blob'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  SNAPSHOT_PREFIX,
  SNAPSHOT_RETENTION,
  blobAccess,
  loadLatest,
  parseSnapshot,
  pruneSnapshots,
  saveSnapshot,
  selectLatestSnapshot,
  selectStaleSnapshots,
  snapshotPathname,
  snapshotTimestamp,
} from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'

vi.mock('@vercel/blob', () => ({
  del: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}))

type ListResult = Awaited<ReturnType<typeof list>>
type GetResult = NonNullable<Awaited<ReturnType<typeof get>>>
type PutResult = Awaited<ReturnType<typeof put>>

const idea: Idea = {
  id: '01',
  body: 'hello',
  createdAt: '2026-09-12T00:00:00.000Z',
  updatedAt: '2026-09-12T00:00:00.000Z',
}

// Fixtures cover only the fields the store reads; the casts keep them in
// step with the SDK's return types without spelling out every property.
function listPage(
  pathnames: string[],
  extra: { cursor?: string; hasMore?: boolean } = {}
): ListResult {
  return {
    blobs: pathnames.map((pathname) => ({
      pathname,
      url: `https://blob.example/${pathname}`,
      downloadUrl: `https://blob.example/${pathname}?download=1`,
      size: 2,
      uploadedAt: new Date('2026-09-12T00:00:00.000Z'),
    })),
    cursor: extra.cursor,
    hasMore: extra.hasMore ?? false,
  } as unknown as ListResult
}

function getResult(json: string): GetResult {
  return {
    statusCode: 200,
    stream: new Response(json).body,
    headers: new Headers(),
    blob: {
      url: 'https://blob.example/x',
      downloadUrl: 'https://blob.example/x?download=1',
      pathname: 'ideas/x.json',
      contentDisposition: 'inline',
      cacheControl: 'no-store',
      uploadedAt: new Date('2026-09-12T00:00:00.000Z'),
      etag: 'etag',
      contentType: 'application/json',
      size: json.length,
    },
  } as unknown as GetResult
}

function putResult(pathname: string): PutResult {
  return {
    url: `https://blob.example/${pathname}`,
    downloadUrl: `https://blob.example/${pathname}?download=1`,
    pathname,
    contentType: 'application/json',
    contentDisposition: 'inline',
    etag: 'etag',
  } as unknown as PutResult
}

beforeEach(() => {
  vi.mocked(del).mockReset()
  vi.mocked(get).mockReset()
  vi.mocked(list).mockReset()
  vi.mocked(put).mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('snapshotPathname', () => {
  it('builds an ideas/ pathname without colons', () => {
    const pathname = snapshotPathname(new Date('2026-09-12T01:02:03.456Z'))
    expect(pathname).toBe('ideas/2026-09-12T01-02-03.456Z.json')
  })

  it('keeps chronological order equal to lexicographic order', () => {
    const earlier = snapshotPathname(new Date('2026-09-12T09:59:59.999Z'))
    const later = snapshotPathname(new Date('2026-09-12T10:00:00.000Z'))
    expect(earlier < later).toBe(true)
  })

  it('produces pathnames that selectLatestSnapshot accepts', () => {
    const blobs = [
      { pathname: snapshotPathname(new Date('2026-09-12T10:00:00.000Z')) },
      { pathname: snapshotPathname(new Date('2026-09-12T10:00:00.001Z')) },
    ]
    expect(selectLatestSnapshot(blobs)).toBe(blobs[1])
  })
})

describe('selectLatestSnapshot', () => {
  it('returns undefined for an empty list', () => {
    expect(selectLatestSnapshot([])).toBeUndefined()
  })

  it('picks the newest pathname regardless of list order', () => {
    const blobs = [
      { pathname: 'ideas/2026-09-12T10-00-00.000Z.json' },
      { pathname: 'ideas/2026-09-13T00-00-00.000Z.json' },
      { pathname: 'ideas/2026-09-11T23-59-59.000Z.json' },
    ]
    expect(selectLatestSnapshot(blobs)?.pathname).toBe(
      'ideas/2026-09-13T00-00-00.000Z.json'
    )
  })

  it('ignores objects that are not snapshots', () => {
    const blobs = [
      { pathname: 'ideas/2026-09-12T10-00-00.000Z.json' },
      { pathname: 'ideas/zzz-not-a-snapshot.txt' },
      { pathname: 'ideas/nested/2026-09-14T00-00-00.000Z.json' },
    ]
    expect(selectLatestSnapshot(blobs)?.pathname).toBe(
      'ideas/2026-09-12T10-00-00.000Z.json'
    )
  })
})

describe('parseSnapshot', () => {
  it('returns the ideas from a JSON array', () => {
    expect(parseSnapshot(JSON.stringify([idea]))).toEqual([idea])
  })

  it('returns an empty array for an empty snapshot', () => {
    expect(parseSnapshot('[]')).toEqual([])
  })

  it('drops malformed entries', () => {
    const json = JSON.stringify([
      idea,
      { id: 'x' },
      { ...idea, id: '' },
      'text',
      null,
    ])
    expect(parseSnapshot(json)).toEqual([idea])
  })

  it('drops entries whose timestamps are not dates', () => {
    const json = JSON.stringify([
      idea,
      { ...idea, id: '02', createdAt: 'tbd' },
      { ...idea, id: '03', updatedAt: '' },
    ])
    expect(parseSnapshot(json)).toEqual([idea])
  })

  it('rejects a top-level object', () => {
    expect(() => parseSnapshot(JSON.stringify({ ideas: [] }))).toThrow(
      /JSON array/
    )
  })
})

describe('blobAccess', () => {
  it('defaults to private when unset', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', undefined)
    expect(blobAccess()).toBe('private')
  })

  it('defaults to private when empty', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', '')
    expect(blobAccess()).toBe('private')
  })

  it('accepts private', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', 'private')
    expect(blobAccess()).toBe('private')
  })

  it('accepts public', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', 'public')
    expect(blobAccess()).toBe('public')
  })

  it('rejects unknown values', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', 'everyone')
    expect(() => blobAccess()).toThrow(/IDEAS_BLOB_ACCESS/)
  })
})

describe('without BLOB_READ_WRITE_TOKEN', () => {
  it.each([
    ['unset', undefined],
    ['empty', ''],
  ])('loadLatest returns an empty array when the token is %s', async (_, v) => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', v)
    await expect(loadLatest()).resolves.toEqual([])
    expect(list).not.toHaveBeenCalled()
  })

  it('saveSnapshot refuses to write', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', undefined)
    await expect(saveSnapshot([])).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/)
    expect(put).not.toHaveBeenCalled()
  })

  it('pruneSnapshots does nothing', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', undefined)
    await expect(pruneSnapshots()).resolves.toEqual([])
    expect(list).not.toHaveBeenCalled()
    expect(del).not.toHaveBeenCalled()
  })
})

describe('loadLatest with a store', () => {
  beforeEach(() => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token')
    vi.stubEnv('IDEAS_BLOB_ACCESS', 'public')
  })

  it('returns an empty array when there are no snapshots', async () => {
    vi.mocked(list).mockResolvedValueOnce(listPage([]))
    await expect(loadLatest()).resolves.toEqual([])
    expect(get).not.toHaveBeenCalled()
  })

  it('reads the newest snapshot without the CDN cache', async () => {
    vi.mocked(list).mockResolvedValueOnce(
      listPage([
        'ideas/2026-09-11T00-00-00.000Z.json',
        'ideas/2026-09-12T00-00-00.000Z.json',
      ])
    )
    vi.mocked(get).mockResolvedValueOnce(getResult(JSON.stringify([idea])))

    await expect(loadLatest()).resolves.toEqual([idea])
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: SNAPSHOT_PREFIX })
    )
    expect(get).toHaveBeenCalledWith(
      'https://blob.example/ideas/2026-09-12T00-00-00.000Z.json',
      { access: 'public', useCache: false }
    )
  })

  it('follows the cursor across pages', async () => {
    vi.mocked(list)
      .mockResolvedValueOnce(
        listPage(['ideas/2026-09-13T00-00-00.000Z.json'], {
          cursor: 'next',
          hasMore: true,
        })
      )
      .mockResolvedValueOnce(listPage(['ideas/2026-09-12T00-00-00.000Z.json']))
    vi.mocked(get).mockResolvedValueOnce(getResult('[]'))

    await loadLatest()
    expect(list).toHaveBeenCalledTimes(2)
    expect(vi.mocked(list).mock.calls[1][0]).toEqual(
      expect.objectContaining({ cursor: 'next' })
    )
    expect(get).toHaveBeenCalledWith(
      'https://blob.example/ideas/2026-09-13T00-00-00.000Z.json',
      expect.anything()
    )
  })

  it('returns an empty array when the snapshot vanished', async () => {
    vi.mocked(list).mockResolvedValueOnce(
      listPage(['ideas/2026-09-12T00-00-00.000Z.json'])
    )
    vi.mocked(get).mockResolvedValueOnce(null)
    await expect(loadLatest()).resolves.toEqual([])
  })
})

describe('saveSnapshot with a store', () => {
  it('writes a JSON snapshot at the timestamped pathname', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token')
    vi.stubEnv('IDEAS_BLOB_ACCESS', undefined)
    vi.mocked(put).mockResolvedValueOnce(
      putResult('ideas/2026-09-12T01-02-03.456Z.json')
    )

    const now = new Date('2026-09-12T01:02:03.456Z')
    await expect(saveSnapshot([idea], now)).resolves.toBe(
      'ideas/2026-09-12T01-02-03.456Z.json'
    )
    expect(put).toHaveBeenCalledWith(
      'ideas/2026-09-12T01-02-03.456Z.json',
      JSON.stringify([idea]),
      {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
      }
    )
  })
})

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-09-13T12:00:00.000Z')

/** A snapshot pathname taken `daysAgo` days before NOW (plus `offsetMs`). */
function snapshotAgo(daysAgo: number, offsetMs = 0): string {
  return snapshotPathname(new Date(NOW.getTime() - daysAgo * DAY + offsetMs))
}

/** `count` snapshots one minute apart, all taken `daysAgo` days ago; oldest first. */
function burst(count: number, daysAgo: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    snapshotAgo(daysAgo, (index - count) * 60 * 1000)
  )
}

const blobs = (pathnames: string[]) =>
  pathnames.map((pathname) => ({ pathname }))

const stalePaths = (
  pathnames: string[],
  policy = SNAPSHOT_RETENTION,
  now = NOW
) => selectStaleSnapshots(blobs(pathnames), now, policy).map((b) => b.pathname)

describe('snapshotTimestamp', () => {
  it('inverts snapshotPathname', () => {
    const at = new Date('2026-09-12T01:02:03.456Z')
    expect(snapshotTimestamp(snapshotPathname(at))).toBe(at.getTime())
  })

  it.each([['a hand-placed name', 'ideas/2026-09-12T00-00-00.000Z.json']])(
    'parses %s',
    (_, pathname) => {
      expect(snapshotTimestamp(pathname)).toBe(
        Date.parse('2026-09-12T00:00:00.000Z')
      )
    }
  )

  it.each([
    ['a non-snapshot object', 'ideas/notes.txt'],
    ['a nested object', 'ideas/nested/2026-01-01T00-00-00.000Z.json'],
    ['a json file without a timestamp', 'ideas/backup.json'],
    ['an impossible date', 'ideas/2026-13-45T00-00-00.000Z.json'],
  ])('returns undefined for %s', (_, pathname) => {
    expect(snapshotTimestamp(pathname)).toBeUndefined()
  })
})

describe('selectStaleSnapshots', () => {
  it('uses the agreed policy by default', () => {
    expect(SNAPSHOT_RETENTION).toEqual({
      keepAlways: 5,
      keepRecent: 30,
      maxAgeMs: 30 * DAY,
    })
  })

  it('keeps everything while all snapshots are recent and within the count', () => {
    const names = Array.from({ length: 30 }, (_, i) => snapshotAgo(29 - i))
    expect(stalePaths(names)).toEqual([])
  })

  it('drops snapshots past the newest 30 even when they are recent', () => {
    const names = burst(33, 1)
    expect(stalePaths(names)).toEqual(names.slice(0, 3))
  })

  it('drops snapshots older than 30 days once they are past the newest 5', () => {
    const kept = [
      snapshotAgo(31),
      snapshotAgo(29),
      snapshotAgo(2),
      snapshotAgo(1),
      snapshotAgo(0),
    ]
    expect(stalePaths(kept)).toEqual([])

    const withOlder = [snapshotAgo(60), snapshotAgo(45), ...kept]
    expect(stalePaths(withOlder)).toEqual([snapshotAgo(60), snapshotAgo(45)])
  })

  it('treats exactly 30 days old as stale and just under as fresh', () => {
    const names = [
      snapshotAgo(30),
      snapshotAgo(30, 1),
      snapshotAgo(4),
      snapshotAgo(3),
      snapshotAgo(2),
      snapshotAgo(1),
      snapshotAgo(0),
    ]
    expect(stalePaths(names)).toEqual([snapshotAgo(30)])
  })

  it('always keeps the newest 5, however old they are', () => {
    const names = [
      snapshotAgo(400),
      snapshotAgo(300),
      snapshotAgo(200),
      snapshotAgo(100),
      snapshotAgo(90),
    ]
    expect(stalePaths(names)).toEqual([])
    expect(stalePaths([snapshotAgo(500), ...names])).toEqual([snapshotAgo(500)])
  })

  it('returns the stale ones oldest first regardless of input order', () => {
    const names = burst(8, 40)
    const shuffled = [
      names[5],
      names[0],
      names[7],
      names[2],
      names[6],
      names[1],
      names[4],
      names[3],
    ]
    expect(stalePaths(shuffled)).toEqual(names.slice(0, 3))
  })

  it('ignores objects that are not snapshots when ranking', () => {
    const names = burst(6, 1)
    const mixed = ['ideas/notes.txt', ...names, 'ideas/nested/x.json']
    expect(
      stalePaths(mixed, { keepAlways: 2, keepRecent: 4, maxAgeMs: 30 * DAY })
    ).toEqual(names.slice(0, 2))
  })

  it('never selects the newest snapshot even with a zero or negative policy', () => {
    const names = burst(3, 100)
    expect(
      stalePaths(names, { keepAlways: 0, keepRecent: 0, maxAgeMs: 0 })
    ).toEqual(names.slice(0, 2))
    expect(
      stalePaths(names, { keepAlways: -5, keepRecent: -5, maxAgeMs: -1 })
    ).toEqual(names.slice(0, 2))
  })

  it('does not let keepRecent undercut keepAlways', () => {
    const names = burst(6, 1)
    expect(
      stalePaths(names, { keepAlways: 4, keepRecent: 2, maxAgeMs: 30 * DAY })
    ).toEqual(names.slice(0, 2))
  })

  it('returns an empty array for an empty list', () => {
    expect(stalePaths([])).toEqual([])
  })

  it('settles between 5 and 30 snapshots under weekly saves', () => {
    let names: string[] = []
    for (let week = 0; week < 104; week += 1) {
      const at = new Date('2026-01-04T00:00:00.000Z').getTime() + week * 7 * DAY
      names = [...names, snapshotPathname(new Date(at))]
      const stale = selectStaleSnapshots(blobs(names), new Date(at))
      names = names.filter((n) => !stale.some((s) => s.pathname === n))
      expect(names.length).toBeGreaterThanOrEqual(Math.min(5, week + 1))
      expect(names.length).toBeLessThanOrEqual(30)
      expect(names[names.length - 1]).toBe(snapshotPathname(new Date(at)))
    }
    // Weekly saves fall out by age after ~4 weeks, so 5 survive, not 30.
    expect(names).toHaveLength(5)
  })
})

describe('pruneSnapshots with a store', () => {
  beforeEach(() => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token')
  })

  it('deletes what the policy drops, by url, and returns their pathnames', async () => {
    const names = [snapshotAgo(60), snapshotAgo(50), ...burst(5, 1)]
    vi.mocked(list).mockResolvedValueOnce(listPage(names))
    vi.mocked(del).mockResolvedValueOnce()

    await expect(pruneSnapshots(NOW)).resolves.toEqual([
      snapshotAgo(60),
      snapshotAgo(50),
    ])
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: SNAPSHOT_PREFIX })
    )
    expect(del).toHaveBeenCalledTimes(1)
    expect(del).toHaveBeenCalledWith([
      `https://blob.example/${snapshotAgo(60)}`,
      `https://blob.example/${snapshotAgo(50)}`,
    ])
  })

  it('does not call del when nothing is stale', async () => {
    vi.mocked(list).mockResolvedValueOnce(listPage(burst(10, 1)))
    await expect(pruneSnapshots(NOW)).resolves.toEqual([])
    expect(del).not.toHaveBeenCalled()
  })

  it('ranks snapshots across list pages', async () => {
    const names = burst(33, 1)
    vi.mocked(list)
      .mockResolvedValueOnce(
        listPage(names.slice(20), { cursor: 'next', hasMore: true })
      )
      .mockResolvedValueOnce(listPage(names.slice(0, 20)))
    vi.mocked(del).mockResolvedValueOnce()

    await expect(pruneSnapshots(NOW)).resolves.toEqual(names.slice(0, 3))
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('propagates a delete failure so the caller can decide', async () => {
    vi.mocked(list).mockResolvedValueOnce(
      listPage([snapshotAgo(60), ...burst(5, 1)])
    )
    vi.mocked(del).mockRejectedValueOnce(new Error('blob exploded'))
    await expect(pruneSnapshots(NOW)).rejects.toThrow('blob exploded')
  })
})
