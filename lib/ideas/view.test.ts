import { describe, expect, it } from 'vitest'

import { Idea } from '@/lib/ideas/types'
import { sortNewestFirst, toIdeaView } from '@/lib/ideas/view'

function idea(id: string, createdAt: string, body = id): Idea {
  return { id, body, createdAt, updatedAt: createdAt }
}

describe('toIdeaView', () => {
  it('formats the timestamp in Asia/Tokyo and renders the body', async () => {
    const view = await toIdeaView(
      idea('a', '2026-09-12T01:02:03.456Z', '**bold** <img src=x onerror=1>')
    )

    expect(view).toEqual({
      id: 'a',
      createdAt: '2026-09-12T01:02:03.456Z',
      createdAtLabel: '2026.09.12 10:02',
      html: expect.stringContaining('<strong>bold</strong>'),
    })
    expect(view.html).not.toContain('onerror')
  })
})

describe('sortNewestFirst', () => {
  it('orders by createdAt descending without mutating the input', () => {
    const input = [
      idea('old', '2026-09-11T00:00:00.000Z'),
      idea('new', '2026-09-13T00:00:00.000Z'),
      idea('mid', '2026-09-12T00:00:00.000Z'),
    ]
    const snapshot = [...input]

    expect(sortNewestFirst(input).map((entry) => entry.id)).toEqual([
      'new',
      'mid',
      'old',
    ])
    expect(input).toEqual(snapshot)
  })

  it('keeps the original order for equal timestamps', () => {
    const input = [
      idea('a', '2026-09-12T00:00:00.000Z'),
      idea('b', '2026-09-12T00:00:00.000Z'),
    ]

    expect(sortNewestFirst(input).map((entry) => entry.id)).toEqual(['a', 'b'])
  })
})
