import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

describe('cn', () => {
  it('returns an empty string when called without arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns an empty string when every argument is falsy', () => {
    expect(cn(false, undefined, null, '')).toBe('')
  })

  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('drops falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('keeps non-conflicting tailwind classes when merging', () => {
    expect(cn('text-red-500 p-2', 'p-4')).toBe('text-red-500 p-4')
  })
})
