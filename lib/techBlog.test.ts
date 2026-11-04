import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  decodeXmlEntities,
  fetchTechBlogArticles,
  parseTechBlogRss,
  TECH_BLOG_FEED_URL,
  toJstDate,
} from '@/lib/techBlog'

// はてなブログの著者別 RSS を 2 件ぶんに切り詰めたもの
const RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>shoota-dev - Findy Tech Blog</title>
    <link>https://tech.findy.co.jp/archive/author/shoota-dev</link>
    <item>
      <title>「Tidy First?」から紐解く &amp; 学ぶ</title>
      <link>https://tech.findy.co.jp/entry/2025/02/17/070000</link>
      <description>&lt;p&gt;本文&lt;/p&gt;</description>
      <pubDate>Mon, 17 Feb 2025 07:00:00 +0900</pubDate>
      <guid isPermaLink="false">hatenablog://entry/1</guid>
      <enclosure url="https://cdn.image.st-hatena.com/image/scale/abc/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fa.png" type="image/png" length="0" />
    </item>
    <item>
      <title>画像のない記事</title>
      <link>https://tech.findy.co.jp/entry/2024/04/01/080000</link>
      <pubDate>Mon, 01 Apr 2024 08:00:00 +0900</pubDate>
      <guid isPermaLink="false">hatenablog://entry/2</guid>
    </item>
    <item>
      <title>日付のない item は飛ばす</title>
      <link>https://tech.findy.co.jp/entry/broken</link>
    </item>
  </channel>
</rss>`

describe('parseTechBlogRss', () => {
  it('はてなブログの RSS から題名・URL・日付・アイキャッチを取り出す', () => {
    expect(parseTechBlogRss(RSS)).toEqual([
      {
        title: '「Tidy First?」から紐解く & 学ぶ',
        url: 'https://tech.findy.co.jp/entry/2025/02/17/070000',
        date: '2025-02-17',
        image:
          'https://cdn.image.st-hatena.com/image/scale/abc/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fa.png',
      },
      {
        title: '画像のない記事',
        url: 'https://tech.findy.co.jp/entry/2024/04/01/080000',
        date: '2024-04-01',
      },
    ])
  })

  it('item が無ければ空の配列を返す', () => {
    expect(parseTechBlogRss('<rss><channel></channel></rss>')).toEqual([])
  })
})

describe('toJstDate', () => {
  it('朝 7 時公開の記事が前日にずれない（UTC では前日 22 時）', () => {
    expect(toJstDate('Fri, 30 Oct 2026 07:00:00 +0900')).toBe('2026-10-30')
  })

  it('別のタイムゾーンで書かれていても日本時間の日付にする', () => {
    expect(toJstDate('Thu, 29 Oct 2026 22:00:00 +0000')).toBe('2026-10-30')
  })

  it('読めない日付は undefined', () => {
    expect(toJstDate('not a date')).toBeUndefined()
  })
})

describe('decodeXmlEntities', () => {
  it('名前付きと数値の文字参照を戻す', () => {
    expect(
      decodeXmlEntities(
        'a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#x27; &#12354;'
      )
    ).toBe('a & b <c> "d" \'e\' あ')
  })
})

describe('TECH_BLOG_FEED_URL', () => {
  it('著者別の RSS を指す', () => {
    expect(TECH_BLOG_FEED_URL).toBe(
      'https://tech.findy.co.jp/rss/author/shoota-dev'
    )
  })
})

describe('fetchTechBlogArticles', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('RSS を取ってきて記事にする', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(RSS)))
    const articles = await fetchTechBlogArticles('https://example.com/rss')
    expect(articles.map((article) => article.date)).toEqual([
      '2025-02-17',
      '2024-04-01',
    ])
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/rss',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it('HTTP エラーのときは空の配列にしてビルドを止めない', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 500 }))
    )
    await expect(
      fetchTechBlogArticles('https://example.com/rss')
    ).resolves.toEqual([])
  })

  it('接続できない・時間切れのときも空の配列にする', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    await expect(
      fetchTechBlogArticles('https://example.com/rss')
    ).resolves.toEqual([])
  })
})
