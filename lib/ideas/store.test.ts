import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  blobAccess,
  loadLatest,
  parseSnapshot,
  saveSnapshot,
  selectLatestSnapshot,
  snapshotPathname,
} from '@/lib/ideas/store'

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
  const idea = {
    id: '01',
    body: 'hello',
    createdAt: '2026-09-12T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z',
  }

  it('returns the ideas from a JSON array', () => {
    expect(parseSnapshot(JSON.stringify([idea]))).toEqual([idea])
  })

  it('drops malformed entries', () => {
    const json = JSON.stringify([idea, { id: 'x' }, 'text', null])
    expect(parseSnapshot(json)).toEqual([idea])
  })

  it('rejects a top-level object', () => {
    expect(() => parseSnapshot(JSON.stringify({ ideas: [] }))).toThrow(
      /JSON array/
    )
  })
})

describe('blobAccess', () => {
  it('defaults to private', () => {
    vi.stubEnv('IDEAS_BLOB_ACCESS', '')
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
  it('loadLatest returns an empty array', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')
    await expect(loadLatest()).resolves.toEqual([])
  })

  it('saveSnapshot refuses to write', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')
    await expect(saveSnapshot([])).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/)
  })
})
