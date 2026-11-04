/**
 * 発信（登壇・出演・取材）の記録。Findy Tech Blog の記事は RSS から取るので
 * ここには持たず、`lib/techBlog.ts` を見る。
 */

import type { TechBlogArticle } from '@/lib/techBlog'

export type MediaEntry = {
  /** Podcast / Interview などの種別 */
  kind: string
  title: string
  /** 番組名や掲載先 */
  source: string
  url: string
  /** 公開日 (yyyy-MM-dd) */
  date: string
}

export type Talk = {
  title: string
  url: string
  /** Speaker Deck のプレゼンテーション ID（サムネイルの URL に使う） */
  deckId: string
  /** 公開日 (yyyy-MM-dd) */
  date: string
  slides: number
  /** バッジに出す登壇先。Findy の connpass イベントは 'Findy' とする */
  event?: string
}

export const TALKS: Talk[] = [
  {
    title: '不要なレビューをAIにまかせて AIコーディングの環境改善を加速した',
    url: 'https://speakerdeck.com/shoota/approve-from-ai-with-tidying-change-f72da107-b24b-4b68-a494-762fed93943e',
    deckId: 'ab4dddb85f1a4d07a47d3ff54a7626a1',
    date: '2026-06-24',
    slides: 22,
    event: 'Findy',
  },
  {
    title: '組織の中で自分を経営する技術',
    url: 'https://speakerdeck.com/shoota/art-of-self-management',
    deckId: 'ba49da85e7ce45d8aa3ba19ab387422d',
    date: '2026-05-27',
    slides: 26,
    event: 'Qiita Conference 2026',
  },
  {
    title:
      '大規模モノレポの秩序管理 失速しない多言語化フロントエンドの運用 / JSConf JP 2025',
    url: 'https://speakerdeck.com/shoota/da-gui-mo-monoreponozhi-xu-guan-li-shi-su-sinaiduo-yan-yu-hua-hurontoendonoyun-yong',
    deckId: '604def4c3d8f4b49b1975bec91f10bd9',
    date: '2025-11-16',
    slides: 64,
    event: 'JSConf JP 2025',
  },
  {
    title: 'AIの個性を理解し、指揮する',
    url: 'https://speakerdeck.com/shoota/ai-characteristic',
    deckId: 'f42c257808e7421190b96b22d991898e',
    date: '2025-10-29',
    slides: 18,
    event: 'Findy',
  },
  {
    title: '開発生産性向上！ 育成を「改善」と捉えるエンジニア育成戦略',
    url: 'https://speakerdeck.com/shoota/growth-engineer',
    deckId: 'cdf74a17686a4f1e86de14e25b785021',
    date: '2024-12-05',
    slides: 15,
    event: 'Findy',
  },
  {
    title:
      '自己改善からチームを動かす！ 「セルフエンジニアリングマネージャー」のすゝめ',
    url: 'https://speakerdeck.com/shoota/zi-ji-gai-shan-karatimuwodong-kasu-seruhuenziniaringumaneziya-nosu-me',
    deckId: 'f6a8658e814a484c9f7e9a553e519490',
    date: '2024-04-22',
    slides: 26,
    event: 'Findy',
  },
]

/** 出演した Podcast や、取材を受けた記事。新しい順 */
export const MEDIA: MediaEntry[] = [
  {
    kind: 'Podcast',
    title: '#10【番外編】DevRelとテックリードエンジニアのゆるく話す会',
    source: 'Engineer Lab.fm',
    url: 'https://open.spotify.com/episode/3ooMq1BPDltSIZ82C6PYmh',
    date: '2026-03-03',
  },
  {
    kind: 'Interview',
    title: '全てのエンジニアがプロダクトに集中できる世界へ',
    source: 'ファインディ公式note エンジニアインタビュー',
    url: 'https://note.findy.co.jp/n/ne15a6c2c3e81',
    date: '2024-12-17',
  },
  {
    kind: 'Podcast',
    title: '#1 青森からのフルリモートワークについて',
    source: 'グロービス・テック・トーク',
    url: 'https://open.spotify.com/episode/3MXfGbSFJizIkZbKHqOxsv',
    date: '2022-02-25',
  },
]

export const talkThumbnail = (deckId: string) =>
  `https://files.speakerdeck.com/presentations/${deckId}/preview_slide_0.jpg`

/** 発信の 1 件。種別ごとに元のデータをそのまま持ち、日付で並べ替える */
export type OutputEntry =
  | { kind: 'talk'; date: string; talk: Talk }
  | { kind: 'media'; date: string; media: MediaEntry }
  | { kind: 'article'; date: string; article: TechBlogArticle }

const byDateDesc = (a: OutputEntry, b: OutputEntry) =>
  b.date.localeCompare(a.date)

/** 登壇・出演・記事をひとつの時系列（新しい順）にまとめる */
export const buildOutputs = (
  articles: TechBlogArticle[],
  talks: Talk[] = TALKS,
  media: MediaEntry[] = MEDIA
): OutputEntry[] =>
  [
    ...talks.map((talk): OutputEntry => ({
      kind: 'talk',
      date: talk.date,
      talk,
    })),
    ...media.map((entry): OutputEntry => ({
      kind: 'media',
      date: entry.date,
      media: entry,
    })),
    ...articles.map((article): OutputEntry => ({
      kind: 'article',
      date: article.date,
      article,
    })),
  ].sort(byDateDesc)

/** 新しい順に並んだ一覧を、年ごとの見出しで区切る */
export const groupByYear = (
  entries: OutputEntry[]
): { year: string; entries: OutputEntry[] }[] => {
  const groups: { year: string; entries: OutputEntry[] }[] = []
  for (const entry of entries) {
    const year = entry.date.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.entries.push(entry)
    else groups.push({ year, entries: [entry] })
  }
  return groups
}

/** 一覧の要素の key。URL は種別をまたいでも重ならない */
export const outputKey = (entry: OutputEntry): string => {
  switch (entry.kind) {
    case 'talk':
      return entry.talk.url
    case 'media':
      return entry.media.url
    case 'article':
      return entry.article.url
  }
}
