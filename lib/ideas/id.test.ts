import { describe, expect, it } from 'vitest'

import {
  IDEA_ID_PATTERN,
  MAX_IDEA_ID_LENGTH,
  generateIdeaId,
  isIdeaId,
} from '@/lib/ideas/id'

describe('generateIdeaId', () => {
  it('embeds a compact UTC timestamp and the suffix', () => {
    expect(generateIdeaId(new Date('2026-09-12T01:02:03.456Z'), 'abc123')).toBe(
      '20260912T010203456Z-abc123'
    )
  })

  it('only uses URL-safe characters', () => {
    expect(generateIdeaId()).toMatch(IDEA_ID_PATTERN)
  })

  it('passes the route guard', () => {
    expect(isIdeaId(generateIdeaId())).toBe(true)
  })

  it('sorts chronologically', () => {
    const earlier = generateIdeaId(new Date('2026-09-12T09:59:59.999Z'), 'ff')
    const later = generateIdeaId(new Date('2026-09-12T10:00:00.000Z'), '00')
    expect(earlier < later).toBe(true)
  })

  it('differs for the same millisecond', () => {
    const now = new Date('2026-09-12T10:00:00.000Z')
    expect(generateIdeaId(now)).not.toBe(generateIdeaId(now))
  })
})

describe('isIdeaId', () => {
  it.each([
    ['a server-generated id', '20260912T010203456Z-9f3a1b'],
    ['a hand-placed id', '20260912-001'],
    ['a single character', 'a'],
    ['the maximum length', 'x'.repeat(MAX_IDEA_ID_LENGTH)],
  ])('accepts %s', (_, id) => {
    expect(isIdeaId(id)).toBe(true)
  })

  it.each([
    ['an empty string', ''],
    ['a path traversal', '..'],
    ['a slash', 'a/b'],
    ['a dot', 'a.json'],
    ['whitespace', 'a b'],
    ['a query string', 'a?b=c'],
    ['an encoded character', 'a%2Fb'],
    ['a non-ASCII letter', 'アイデア'],
    ['one over the maximum length', 'x'.repeat(MAX_IDEA_ID_LENGTH + 1)],
  ])('rejects %s', (_, id) => {
    expect(isIdeaId(id)).toBe(false)
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a number', 42],
    ['an array of ids', ['20260912-001']],
    ['an object', { id: '20260912-001' }],
  ])('rejects %s', (_, value) => {
    expect(isIdeaId(value)).toBe(false)
  })
})
