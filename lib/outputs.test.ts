import { describe, expect, it } from 'vitest'

import { MEDIA, TALKS } from '@/lib/outputs'

describe('TALKS / MEDIA', () => {
  it('日付は yyyy-MM-dd で、新しい順に並んでいる', () => {
    for (const list of [TALKS, MEDIA]) {
      for (const entry of list)
        expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (let i = 1; i < list.length; i++) {
        expect(list[i - 1].date >= list[i].date).toBe(true)
      }
    }
  })
})
