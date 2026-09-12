import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IDEAS_PATH,
  ideaPath,
  listIdeaPaths,
  loadIdeaPage,
} from '@/lib/ideas/detail'
import { loadLatest } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'
import { IDEAS_REVALIDATE_SECONDS } from '@/lib/ideas/view'

vi.mock('@/lib/ideas/store', () => ({
  loadLatest: vi.fn(),
}))

const first: Idea = {
  id: '20260912T010203456Z-9f3a1b',
  body: '# Hello\n\n<script>alert(1)</script>world',
  createdAt: '2026-09-12T01:02:03.456Z',
  updatedAt: '2026-09-12T01:02:03.456Z',
}

const second: Idea = {
  id: '20260912-001',
  body: 'second',
  createdAt: '2026-09-12T00:00:00.000Z',
  updatedAt: '2026-09-12T00:00:00.000Z',
}

beforeEach(() => {
  vi.mocked(loadLatest).mockReset().mockResolvedValue([first, second])
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ideaPath', () => {
  it('builds the detail path under the feed path', () => {
    expect(ideaPath(first.id)).toBe(`${IDEAS_PATH}/${first.id}`)
  })

  it('refuses an id that is not a valid route segment', () => {
    expect(() => ideaPath('../etc')).toThrow()
    expect(() => ideaPath('')).toThrow()
  })
})

describe('loadIdeaPage', () => {
  it('renders a known idea with a formatted label and sanitized HTML', async () => {
    const result = await loadIdeaPage(first.id)

    expect(result).toEqual({
      props: {
        idea: {
          id: first.id,
          createdAt: first.createdAt,
          createdAtLabel: '2026.09.12 10:02',
          html: expect.stringContaining('<h1>Hello</h1>'),
        },
      },
      revalidate: IDEAS_REVALIDATE_SECONDS,
    })
    const html = 'props' in result ? result.props.idea.html : ''
    expect(html).not.toContain('<script')
  })

  it('returns notFound for an unknown but well-formed id', async () => {
    const result = await loadIdeaPage('20260912T000000000Z-000000')

    expect(result).toEqual({
      notFound: true,
      revalidate: IDEAS_REVALIDATE_SECONDS,
    })
    expect(loadLatest).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['an empty id', ''],
    ['a path traversal', '..'],
    ['a slash', 'a/b'],
    ['a dot', `${first.id}.json`],
    ['an over-long id', 'x'.repeat(65)],
    ['an undefined id', undefined],
    ['a catch-all array', [first.id]],
  ])('returns notFound for %s without reading the store', async (_, id) => {
    const result = await loadIdeaPage(id)

    expect(result).toEqual({
      notFound: true,
      revalidate: IDEAS_REVALIDATE_SECONDS,
    })
    expect(loadLatest).not.toHaveBeenCalled()
  })

  it('returns notFound when there are no ideas yet', async () => {
    vi.mocked(loadLatest).mockResolvedValue([])

    expect(await loadIdeaPage(first.id)).toEqual({
      notFound: true,
      revalidate: IDEAS_REVALIDATE_SECONDS,
    })
  })

  it('propagates store failures so the build fails loudly', async () => {
    vi.mocked(loadLatest).mockRejectedValue(new Error('blob exploded'))

    await expect(loadIdeaPage(first.id)).rejects.toThrow('blob exploded')
  })
})

describe('listIdeaPaths', () => {
  it('lists every id in the snapshot as a static path', async () => {
    expect(await listIdeaPaths()).toEqual([
      { params: { id: first.id } },
      { params: { id: second.id } },
    ])
  })

  it('drops ids that are not valid route segments', async () => {
    vi.mocked(loadLatest).mockResolvedValue([
      first,
      { ...second, id: 'bad/id' },
      { ...second, id: 'x'.repeat(65) },
    ])

    expect(await listIdeaPaths()).toEqual([{ params: { id: first.id } }])
  })

  it('returns no paths when there are no ideas', async () => {
    vi.mocked(loadLatest).mockResolvedValue([])

    expect(await listIdeaPaths()).toEqual([])
  })
})
