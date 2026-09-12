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

/** `count` snapshot pathnames one day apart, oldest first. */
function snapshotNames(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return `ideas/2026-09-${day}T00-00-00.000Z.json`
  })
}

describe('selectStaleSnapshots', () => {
  const blobs = (pathnames: string[]) =>
    pathnames.map((pathname) => ({ pathname }))

  it('keeps 50 by default', () => {
    expect(SNAPSHOT_RETENTION).toBe(50)
    expect(selectStaleSnapshots(blobs(snapshotNames(50)))).toEqual([])
    expect(selectStaleSnapshots(blobs(snapshotNames(51)))).toEqual([
      { pathname: snapshotNames(1)[0] },
    ])
  })

  it.each([
    ['fewer than the limit', 2],
    ['exactly the limit', 3],
  ])('selects nothing with %s', (_, count) => {
    expect(selectStaleSnapshots(blobs(snapshotNames(count)), 3)).toEqual([])
  })

  it('selects only the excess, oldest first, regardless of list order', () => {
    const names = snapshotNames(5)
    const shuffled = [names[3], names[0], names[4], names[2], names[1]]
    expect(selectStaleSnapshots(blobs(shuffled), 3)).toEqual([
      { pathname: names[0] },
      { pathname: names[1] },
    ])
  })

  it('never selects the newest snapshot, even when keep is 0 or negative', () => {
    const names = snapshotNames(3)
    expect(selectStaleSnapshots(blobs(names), 0)).toEqual([
      { pathname: names[0] },
      { pathname: names[1] },
    ])
    expect(selectStaleSnapshots(blobs(names), -5)).toEqual([
      { pathname: names[0] },
      { pathname: names[1] },
    ])
  })

  it('ignores objects that are not snapshots when counting and selecting', () => {
    const names = snapshotNames(2)
    const mixed = blobs([
      'ideas/notes.txt',
      'ideas/nested/2026-01-01T00-00-00.000Z.json',
      ...names,
    ])
    expect(selectStaleSnapshots(mixed, 1)).toEqual([{ pathname: names[0] }])
  })

  it('returns an empty array for an empty list', () => {
    expect(selectStaleSnapshots([], 1)).toEqual([])
  })

  it('brings a store far over the limit back to exactly the limit', () => {
    const names = snapshotNames(60)
    const stale = selectStaleSnapshots(blobs(names))
    expect(stale.map((blob) => blob.pathname)).toEqual(names.slice(0, 10))
    const remaining = names.filter(
      (name) => !stale.some((blob) => blob.pathname === name)
    )
    expect(remaining).toHaveLength(SNAPSHOT_RETENTION)
    expect(remaining[remaining.length - 1]).toBe(names[59])
  })

  it('keeps the count at the limit across repeated saves', () => {
    let names = snapshotNames(SNAPSHOT_RETENTION)
    for (let day = 1; day <= 5; day += 1) {
      names = [...names, `ideas/2026-10-0${day}T00-00-00.000Z.json`]
      const stale = selectStaleSnapshots(blobs(names))
      expect(stale).toHaveLength(1)
      names = names.filter((name) => name !== stale[0].pathname)
      expect(names).toHaveLength(SNAPSHOT_RETENTION)
    }
    expect(names[names.length - 1]).toBe('ideas/2026-10-05T00-00-00.000Z.json')
  })
})

describe('pruneSnapshots with a store', () => {
  beforeEach(() => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token')
  })

  it('deletes the excess by url and returns their pathnames', async () => {
    const names = snapshotNames(5)
    vi.mocked(list).mockResolvedValueOnce(listPage(names))
    vi.mocked(del).mockResolvedValueOnce()

    await expect(pruneSnapshots(3)).resolves.toEqual([names[0], names[1]])
    expect(del).toHaveBeenCalledTimes(1)
    expect(del).toHaveBeenCalledWith([
      `https://blob.example/${names[0]}`,
      `https://blob.example/${names[1]}`,
    ])
  })

  it('does not call del when nothing is stale', async () => {
    vi.mocked(list).mockResolvedValueOnce(listPage(snapshotNames(3)))
    await expect(pruneSnapshots(3)).resolves.toEqual([])
    expect(del).not.toHaveBeenCalled()
  })

  it('counts snapshots across list pages', async () => {
    const names = snapshotNames(4)
    vi.mocked(list)
      .mockResolvedValueOnce(
        listPage([names[2], names[3]], { cursor: 'next', hasMore: true })
      )
      .mockResolvedValueOnce(listPage([names[0], names[1]]))
    vi.mocked(del).mockResolvedValueOnce()

    await expect(pruneSnapshots(3)).resolves.toEqual([names[0]])
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('propagates a delete failure so the caller can decide', async () => {
    vi.mocked(list).mockResolvedValueOnce(listPage(snapshotNames(2)))
    vi.mocked(del).mockRejectedValueOnce(new Error('blob exploded'))
    await expect(pruneSnapshots(1)).rejects.toThrow('blob exploded')
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
