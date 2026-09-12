import { timingSafeEqual } from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { isAuthorized } from '@/lib/ideas/auth'

vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>()
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) }
})

const SECRET = 'correct-horse-battery-staple'

afterEach(() => {
  vi.mocked(timingSafeEqual).mockClear()
})

describe('isAuthorized', () => {
  it('accepts the matching bearer token', () => {
    expect(isAuthorized(`Bearer ${SECRET}`, SECRET)).toBe(true)
  })

  it('compares with timingSafeEqual', () => {
    isAuthorized(`Bearer ${SECRET}`, SECRET)
    expect(timingSafeEqual).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['lower-case scheme', `bearer ${SECRET}`],
    ['surrounding whitespace', `  Bearer ${SECRET}  `],
  ])('accepts %s', (_, header) => {
    expect(isAuthorized(header, SECRET)).toBe(true)
  })

  it('rejects a wrong token of the same length', () => {
    const wrong = SECRET.replace(/e/g, 'x')
    expect(wrong.length).toBe(SECRET.length)
    expect(isAuthorized(`Bearer ${wrong}`, SECRET)).toBe(false)
  })

  it.each([
    ['one character longer', `Bearer ${SECRET}x`],
    ['much shorter', 'Bearer a'],
  ])('rejects a token that is %s without calling timingSafeEqual', (_, h) => {
    expect(isAuthorized(h, SECRET)).toBe(false)
    expect(timingSafeEqual).not.toHaveBeenCalled()
  })

  it.each([
    ['undefined', undefined],
    ['empty string', ''],
    ['bare secret without scheme', SECRET],
    ['Basic scheme', `Basic ${SECRET}`],
    ['scheme only', 'Bearer'],
    ['array header', [`Bearer ${SECRET}`]],
  ])('rejects a %s header', (_, header) => {
    expect(isAuthorized(header, SECRET)).toBe(false)
  })

  it.each([
    ['undefined secret', `Bearer ${SECRET}`, undefined],
    ['empty secret with empty token', 'Bearer ', ''],
    ['empty secret with a token', 'Bearer x', ''],
  ])('fails closed with %s', (_, header, secret) => {
    expect(isAuthorized(header, secret)).toBe(false)
    expect(timingSafeEqual).not.toHaveBeenCalled()
  })
})
