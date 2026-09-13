import { describe, expect, it } from 'vitest'

import { isIdeaId } from '@/lib/ideas/id'
import { mockIdeas } from '@/lib/ideas/mock'
import { isIdea } from '@/lib/ideas/types'

describe('mockIdeas', () => {
  it('provides about twenty ideas', () => {
    expect(mockIdeas()).toHaveLength(20)
  })

  it('only contains valid ideas with routable ids', () => {
    for (const idea of mockIdeas()) {
      expect(isIdea(idea)).toBe(true)
      expect(isIdeaId(idea.id)).toBe(true)
    }
  })

  it('gives every idea its own id', () => {
    const ids = mockIdeas().map((idea) => idea.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps ids stable across calls so permalinks survive reloads', () => {
    expect(mockIdeas().map((idea) => idea.id)).toEqual(
      mockIdeas().map((idea) => idea.id)
    )
  })

  it('never has an idea updated before it was created', () => {
    for (const idea of mockIdeas()) {
      expect(idea.updatedAt >= idea.createdAt).toBe(true)
    }
  })

  it('returns a fresh array so callers cannot change the fixture', () => {
    const first = mockIdeas()
    first[0].body = 'changed'
    first.pop()
    const second = mockIdeas()
    expect(second).toHaveLength(20)
    expect(second[0].body).not.toBe('changed')
  })
})
