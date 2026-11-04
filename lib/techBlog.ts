/**
 * Findy Tech Blog (はてなブログ) に書いた記事を、著者別の RSS から取り出す。
 * Atom フィードにはアイキャッチ画像が入らないので RSS 2.0 を使う。
 * XML パーサーは入れず、はてなブログの出力に合わせた文字列処理で済ませる。
 */

export const TECH_BLOG_AUTHOR = 'shoota-dev'

export const TECH_BLOG_FEED_URL = `https://tech.findy.co.jp/rss/author/${TECH_BLOG_AUTHOR}`

export const TECH_BLOG_NAME = 'Findy Tech Blog'

const FETCH_TIMEOUT_MS = 10_000

export type TechBlogArticle = {
  title: string
  url: string
  /** 公開日 (yyyy-MM-dd、日本時間) */
  date: string
  /** アイキャッチ画像。設定していない記事では無い */
  image?: string
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

/** XML の文字参照（名前付き・数値）をもとの文字に戻す */
export const decodeXmlEntities = (value: string): string =>
  value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      return String.fromCodePoint(parseInt(body.slice(2), 16))
    }
    if (body.startsWith('#')) {
      return String.fromCodePoint(parseInt(body.slice(1), 10))
    }
    return ENTITIES[body.toLowerCase()] ?? match
  })

const textOf = (xml: string, tag: string): string | undefined => {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i')
  )
  if (!match) return undefined
  const body = match[1].trim()
  const cdata = body.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/)
  return cdata ? cdata[1].trim() : decodeXmlEntities(body)
}

const attributeOf = (
  xml: string,
  tag: string,
  attribute: string
): string | undefined => {
  const match = xml.match(
    new RegExp(`<${tag}\\s[^>]*?\\b${attribute}="([^"]*)"`, 'i')
  )
  return match ? decodeXmlEntities(match[1]) : undefined
}

const jstDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** RFC 822 形式の pubDate を日本時間の yyyy-MM-dd にする。読めない日付は undefined */
export const toJstDate = (pubDate: string): string | undefined => {
  const time = Date.parse(pubDate)
  if (Number.isNaN(time)) return undefined
  // en-CA ロケールの表記は yyyy-MM-dd
  return jstDate.format(new Date(time))
}

/** RSS 2.0 の XML を記事の一覧にする。題名・URL・日付のどれかが欠けた item は飛ばす */
export const parseTechBlogRss = (xml: string): TechBlogArticle[] => {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  const articles: TechBlogArticle[] = []
  for (const item of items) {
    const title = textOf(item, 'title')
    const url = textOf(item, 'link')
    const pubDate = textOf(item, 'pubDate')
    const date = pubDate ? toJstDate(pubDate) : undefined
    if (!title || !url || !date) continue
    const image = attributeOf(item, 'enclosure', 'url')
    articles.push(image ? { title, url, date, image } : { title, url, date })
  }
  return articles
}

/**
 * 著者別 RSS を取りに行って記事の一覧を返す。取れなかったときは空の配列を返して、
 * ページのビルドは止めない（登壇や出演は変わらず出せる）。
 */
export const fetchTechBlogArticles = async (
  feedUrl: string = TECH_BLOG_FEED_URL
): Promise<TechBlogArticle[]> => {
  try {
    const response = await fetch(feedUrl, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
      // 相手が応答しないときにビルドを止めないよう、待つのは 10 秒まで
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      console.warn(
        `[techBlog] ${feedUrl} returned ${response.status}; showing no articles`
      )
      return []
    }
    return parseTechBlogRss(await response.text())
  } catch (error) {
    console.warn(`[techBlog] failed to fetch ${feedUrl}:`, error)
    return []
  }
}
