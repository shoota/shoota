import { describe, expect, it } from 'vitest'

import { isIdeaId } from '@/lib/ideas/id'
import { mockIdeas } from '@/lib/ideas/mock'
import { MAX_TITLE_LENGTH, normalizeTitle, parseIdea } from '@/lib/ideas/types'

describe('mockIdeas', () => {
  it('provides about twenty ideas', () => {
    expect(mockIdeas()).toHaveLength(21)
  })

  it('only contains valid ideas with routable ids', () => {
    for (const idea of mockIdeas()) {
      expect(parseIdea(idea)).toEqual(idea)
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

  it('mixes titled ideas with untitled ones saved before titles existed', () => {
    const ideas = mockIdeas()
    expect(ideas.some((idea) => idea.title === null)).toBe(true)
    expect(ideas.some((idea) => idea.title !== null)).toBe(true)
  })

  it('includes an idea with a title but no body', () => {
    const ideas = mockIdeas()
    expect(
      ideas.some((idea) => idea.title !== null && idea.body === null)
    ).toBe(true)
    expect(ideas.some((idea) => idea.body !== null)).toBe(true)
  })

  it('only uses titles the API would accept as they are', () => {
    for (const { title } of mockIdeas()) {
      if (title !== null) {
        expect(normalizeTitle(title)).toBe(title)
        expect(title.length).toBeGreaterThan(0)
        expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH)
      }
    }
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
    expect(second).toHaveLength(21)
    expect(second[0].body).not.toBe('changed')
  })
})
