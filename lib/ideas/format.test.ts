import { describe, expect, it } from 'vitest'

import {
  EMPTY_EXCERPT,
  formatIdeaTimestamp,
  ideaExcerpt,
} from '@/lib/ideas/format'

describe('ideaExcerpt', () => {
  it.each([
    ['a heading', '# Title\n\nbody', 'Title'],
    ['a deeper heading', '### Title', 'Title'],
    ['a plain first line', 'first\nsecond', 'first'],
    ['leading blank lines', '\n\n  \n  text  \n', 'text'],
    ['a heading marker without text, then a line', '#\nnext', 'next'],
    ['a hash inside the line', 'issue #12', 'issue #12'],
  ])('takes the first non-empty line from %s', (_, body, expected) => {
    expect(ideaExcerpt(body)).toBe(expected)
  })

  it.each([
    ['an empty body', ''],
    ['only whitespace', ' \n\t\n'],
    ['only heading markers', '#\n##'],
  ])('falls back for %s', (_, body) => {
    expect(ideaExcerpt(body)).toBe(EMPTY_EXCERPT)
  })
})

describe('formatIdeaTimestamp', () => {
  it('formats in Asia/Tokyo by default', () => {
    expect(formatIdeaTimestamp('2026-09-12T01:02:03.456Z')).toBe(
      '2026.09.12 10:02'
    )
  })

  it('rolls the date forward when the zone crosses midnight', () => {
    expect(formatIdeaTimestamp('2026-12-31T15:00:00.000Z')).toBe(
      '2027.01.01 00:00'
    )
  })

  it('uses two-digit 24-hour time', () => {
    expect(formatIdeaTimestamp('2026-09-12T14:05:00.000Z', 'UTC')).toBe(
      '2026.09.12 14:05'
    )
  })
})
