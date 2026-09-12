import { describe, expect, it } from 'vitest'

import { isAuthorized } from '@/lib/ideas/auth'

const SECRET = 'correct-horse-battery-staple'

describe('isAuthorized', () => {
  it('accepts the matching bearer token', () => {
    expect(isAuthorized(`Bearer ${SECRET}`, SECRET)).toBe(true)
  })

  it('accepts a lower-case scheme and surrounding whitespace', () => {
    expect(isAuthorized(`  bearer ${SECRET}  `, SECRET)).toBe(true)
  })

  it('rejects a wrong token of the same length', () => {
    const wrong = SECRET.replace(/e/g, 'x')
    expect(wrong.length).toBe(SECRET.length)
    expect(isAuthorized(`Bearer ${wrong}`, SECRET)).toBe(false)
  })

  it('rejects a token of a different length without throwing', () => {
    expect(isAuthorized(`Bearer ${SECRET}x`, SECRET)).toBe(false)
    expect(isAuthorized('Bearer a', SECRET)).toBe(false)
  })

  it('rejects a missing or malformed header', () => {
    expect(isAuthorized(undefined, SECRET)).toBe(false)
    expect(isAuthorized('', SECRET)).toBe(false)
    expect(isAuthorized(SECRET, SECRET)).toBe(false)
    expect(isAuthorized(`Basic ${SECRET}`, SECRET)).toBe(false)
    expect(isAuthorized('Bearer', SECRET)).toBe(false)
    expect(isAuthorized([`Bearer ${SECRET}`], SECRET)).toBe(false)
  })

  it('fails closed when the secret is not configured', () => {
    expect(isAuthorized(`Bearer ${SECRET}`, undefined)).toBe(false)
    expect(isAuthorized('Bearer ', '')).toBe(false)
    expect(isAuthorized('Bearer x', '')).toBe(false)
  })
})
