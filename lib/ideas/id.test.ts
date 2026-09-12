import { describe, expect, it } from 'vitest'

import { IDEA_ID_PATTERN, generateIdeaId } from '@/lib/ideas/id'

describe('generateIdeaId', () => {
  it('embeds a compact UTC timestamp and the suffix', () => {
    expect(generateIdeaId(new Date('2026-09-12T01:02:03.456Z'), 'abc123')).toBe(
      '20260912T010203456Z-abc123'
    )
  })

  it('only uses URL-safe characters', () => {
    expect(generateIdeaId()).toMatch(IDEA_ID_PATTERN)
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
