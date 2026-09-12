import { describe, expect, it } from 'vitest'

import { formatIdeaTimestamp } from '@/lib/ideas/format'

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
