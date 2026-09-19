import { describe, expect, it } from 'vitest'

import { comparePostsNewestFirst, getAllPosts } from '@/lib/api'

describe('comparePostsNewestFirst', () => {
  it('puts the newer date first', () => {
    const newer = { slug: 'b', date: '2025-01-02' }
    const older = { slug: 'a', date: '2025-01-01' }
    expect([older, newer].sort(comparePostsNewestFirst)).toEqual([newer, older])
  })

  it('breaks a date tie by slug so the order is deterministic', () => {
    const first = { slug: 'githubapps', date: '2018-01-24' }
    const second = { slug: 'hellohexo', date: '2018-01-24' }
    expect([second, first].sort(comparePostsNewestFirst)).toEqual([
      first,
      second,
    ])
    expect(comparePostsNewestFirst(first, second)).toBe(
      -comparePostsNewestFirst(second, first)
    )
  })

  it('returns 0 for the same post', () => {
    const post = { slug: 'a', date: '2025-01-01' }
    expect(comparePostsNewestFirst(post, { ...post })).toBe(0)
  })

  it('sorts a post without a date last', () => {
    const dated = { slug: 'z', date: '2000-01-01' }
    const undated = { slug: 'a' }
    expect([undated, dated].sort(comparePostsNewestFirst)).toEqual([
      dated,
      undated,
    ])
  })
})

describe('getAllPosts', () => {
  it('returns the posts strictly newest first', () => {
    const posts = getAllPosts(['slug', 'date'])
    expect(posts.length).toBeGreaterThan(1)
    for (let i = 1; i < posts.length; i++) {
      expect(
        comparePostsNewestFirst(posts[i - 1], posts[i]),
        `${posts[i - 1].slug} before ${posts[i].slug}`
      ).toBeLessThan(0)
    }
  })

  it('keeps the same order whether or not date is requested', () => {
    const withDate = getAllPosts(['slug', 'date']).map((post) => post.slug)
    const withoutDate = getAllPosts(['title', 'slug']).map((post) => post.slug)
    const slugOnly = getAllPosts(['slug']).map((post) => post.slug)
    expect(withoutDate).toEqual(withDate)
    expect(slugOnly).toEqual(withDate)
  })

  it('does not leak fields that were used only for sorting', () => {
    const posts = getAllPosts(['title'])
    for (const post of posts) {
      expect(Object.keys(post).sort()).toEqual(['title'])
    }
    const withSlug = getAllPosts(['title', 'slug'])
    for (const post of withSlug) {
      expect(Object.keys(post).sort()).toEqual(['slug', 'title'])
    }
  })
})
