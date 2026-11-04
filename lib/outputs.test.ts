import { describe, expect, it } from 'vitest'

import {
  buildOutputs,
  groupByYear,
  MEDIA,
  outputKey,
  TALKS,
  type MediaEntry,
  type Talk,
} from '@/lib/outputs'
import type { TechBlogArticle } from '@/lib/techBlog'

const talk: Talk = {
  title: 'talk',
  url: 'https://speakerdeck.com/shoota/talk',
  deckId: 'deck',
  date: '2025-11-16',
  slides: 10,
}

const media: MediaEntry = {
  kind: 'Podcast',
  title: 'podcast',
  source: 'fm',
  url: 'https://example.com/podcast',
  date: '2026-03-03',
}

const article: TechBlogArticle = {
  title: 'article',
  url: 'https://tech.findy.co.jp/entry/2025/11/27/070000',
  date: '2025-11-27',
}

describe('buildOutputs', () => {
  it('登壇・出演・記事を種別をまたいで新しい順に並べる', () => {
    const entries = buildOutputs([article], [talk], [media])
    expect(entries.map((entry) => entry.kind)).toEqual([
      'media',
      'article',
      'talk',
    ])
    expect(entries.map((entry) => entry.date)).toEqual([
      '2026-03-03',
      '2025-11-27',
      '2025-11-16',
    ])
  })

  it('記事が取れなかったときも登壇と出演は並ぶ', () => {
    const entries = buildOutputs([])
    expect(entries).toHaveLength(TALKS.length + MEDIA.length)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].date >= entries[i].date).toBe(true)
    }
  })

  it('key は元の URL で、種別をまたいで重ならない', () => {
    const keys = buildOutputs([article], [talk], [media]).map(outputKey)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain(article.url)
  })
})

describe('groupByYear', () => {
  it('新しい順のまま年ごとに区切る', () => {
    const groups = groupByYear(buildOutputs([article], [talk], [media]))
    expect(groups.map((group) => group.year)).toEqual(['2026', '2025'])
    expect(groups[1].entries.map((entry) => entry.kind)).toEqual([
      'article',
      'talk',
    ])
  })

  it('空なら空', () => {
    expect(groupByYear([])).toEqual([])
  })
})

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
