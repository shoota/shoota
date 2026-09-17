import { generateIdeaId } from '@/lib/ideas/id'
import type { Idea } from '@/lib/ideas/types'

type MockEntry = {
  createdAt: string
  /** Set for ideas that were edited after posting. */
  updatedAt?: string
  /** Omitted for ideas posted before titles existed. */
  title?: string
  /** Omitted for ideas posted with a blank body. */
  body?: string
}

/**
 * Listed oldest first, the order the post API appends in. The oldest few
 * have no title, like the ideas saved before titles existed, and some of
 * those use a Markdown heading in its place; one has a title but no body.
 * Titles vary in length and bodies cover the Markdown the renderer supports
 * (headings, lists, code, tables, quotes, long unbroken text) so the feed
 * can be styled against all of them.
 */
const MOCK_ENTRIES: MockEntry[] = [
  {
    createdAt: '2026-07-19T22:07:00.000Z',
    body: 'アイデアを置く場所を作る。ブログほど構えず、SNS ほど流れていかない場所。',
  },
  {
    createdAt: '2026-07-29T01:00:00.000Z',
    updatedAt: '2026-08-01T16:00:00.000Z',
    body: [
      '### カードの余白',
      '',
      '本文が 1 行だけのときと長文のときで、カードの上下の余白が同じだと短い方が間延びして見える。行数に応じて変えるべきか、それとも揃えるべきか。',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-05T19:15:00.000Z',
    body: '`git worktree` を使うと、ブランチを切り替えずに複数の作業を並行できる。`npm run dev` を worktree ごとに別ポートで立ち上げるスクリプトを書く。',
  },
  {
    createdAt: '2026-08-10T14:59:00.000Z',
    body: [
      '# お茶メモ',
      '',
      '🍵 お茶の淹れ方をメモするページが欲しい。温度と時間を毎回忘れる。',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-13T03:30:00.000Z',
    title: 'English Fridays',
    body: 'Try writing ideas in English once a week.',
  },
  {
    createdAt: '2026-08-15T17:20:00.000Z',
    title: '今年やりたいこと',
    body: [
      '上半期はほとんど手をつけられなかったので、残り 4 か月で 3 つに絞る。',
      '',
      '---',
      '',
      '1 つ目は、このサイトのデザインを一新すること。',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-19T00:45:00.000Z',
    title: '週末にやること',
    body: [
      '1. 本棚の整理',
      '   - 読み終わった本は手放す',
      '   - 積読は 5 冊まで',
      '2. 自転車の空気を入れる',
      '3. ブログの下書きを 1 本仕上げる',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-21T06:02:00.000Z',
    title: 'あとで読む',
    body: 'https://example.com/articles/2026/08/a-very-long-path-segment-that-keeps-going-without-any-break-to-check-how-the-card-wraps-overflowing-text',
  },
  {
    createdAt: '2026-08-23T21:33:00.000Z',
    title: '続けるコツ',
    body: '~~毎日書く~~ **書きたいときに書く**。続けるコツは *義務にしない* こと。',
  },
  {
    createdAt: '2026-08-26T12:10:00.000Z',
    title: 'アイデアページの TODO',
    body: [
      '- [x] 投稿 API',
      '- [x] 管理ページ',
      '- [ ] RSS フィード',
      '- [ ] タグ付け',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-28T02:55:00.000Z',
    title: '本文フォントの候補',
    body: [
      '候補を比べる。',
      '',
      '| フォント | 和文 | 欧文 | 備考 |',
      '| --- | --- | --- | --- |',
      '| Noto Sans JP | ◎ | ○ | 無難 |',
      '| IBM Plex Sans JP | ○ | ◎ | コードと相性がいい |',
      '| BIZ UDPGothic | ○ | △ | 可読性重視 |',
    ].join('\n'),
  },
  {
    createdAt: '2026-08-29T23:05:00.000Z',
    title: '雨の日の散歩道',
    body: [
      '傘に当たる音のリズム',
      'これを BPM に変換したら',
      '何の曲になるだろう',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-01T05:40:00.000Z',
    title:
      '週末プロジェクトの振り返り：アイデア置き場を作っていたら、いつの間にか小さなアプリになっていた話',
    body: [
      '最初は「アイデアを貼るだけのページ」のつもりだったのに、投稿 API、管理ページ、編集と削除、スナップショットの保持ルールと、気づけば小さなアプリになっていた。作っている間はずっと楽しかったけれど、肝心のアイデアはまだ数えるほどしか書いていない。',
      '',
      '道具を作ること自体が目的になりかけていたのは反省点。とはいえ、スマホから 1 タップで書ける状態になったのは大きい。電車の中で思いついたことを、忘れる前に置いておける。',
      '',
      '## 次にやること',
      '',
      '書いたアイデアを見返す仕組みが欲しい。たとえば 1 か月前の今日に書いたものをトップに出す、あるいはランダムに 1 件表示する。書くだけで見返さないメモは、書かなかったのとあまり変わらない。',
      '',
      'もう一つは、アイデア同士をつなぐこと。似たことを何度も書いているはずなので、タグなりリンクなりで束ねられれば、繰り返し出てくるテーマが見えてくると思う。',
      '',
      'しばらくは機能を足さずに、書く量を増やすことに集中する。',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-02T18:18:00.000Z',
    title: 'App Router に移行するか',
    body: 'Next.js の App Router に移行するかどうか。ISR と on-demand revalidation が Pages Router と同じ感覚で使えるなら、そろそろ考えてもいい。まずは /ideas だけ app/ に置いて様子を見る？',
  },
  {
    createdAt: '2026-09-05T03:00:00.000Z',
    title: '書くことは考えること',
    body: [
      '> 書くことは考えることだ。',
      '',
      '誰の言葉だったか思い出せないけど、アイデアを書き留める習慣の理由としてはこれで十分。',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-06T14:30:00.000Z',
    title: 'Vercel Blob を読み直す',
    body: '[Vercel Blob のドキュメント](https://vercel.com/docs/storage/vercel-blob) を読み直す。private ストアのキャッシュ挙動がまだよくわかっていない。',
  },
  {
    createdAt: '2026-09-08T01:12:00.000Z',
    title: '日付ごとのグルーピング',
    body: [
      '`sortNewestFirst` を汎用化して、日付ごとにグルーピングできるようにしたい。',
      '',
      '```ts',
      'function groupByDay<T extends { createdAt: string }>(items: T[]) {',
      '  const groups = new Map<string, T[]>()',
      '  for (const item of items) {',
      '    const day = item.createdAt.slice(0, 10)',
      '    groups.set(day, [...(groups.get(day) ?? []), item])',
      '  }',
      '  return groups',
      '}',
      '```',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-09T13:47:00.000Z',
    updatedAt: '2026-09-10T00:20:00.000Z',
    title: '開くまでの速さ',
    body: [
      '朝の散歩中に思いついたこと。',
      '',
      '小さく作って毎日触る道具は、機能より「開くまでの速さ」で使われるかどうかが決まる。起動に 3 秒かかるメモアプリは、結局開かなくなった。',
      '',
      'だからアイデア置き場も、スマホのホーム画面から 1 タップで書けることを最優先にしたい。',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-10T16:05:00.000Z',
    title: '読書メモを公開する',
    body: [
      'Kindle のハイライトを眠らせておくのはもったいない。',
      '',
      '### 手順',
      '',
      '- ハイライトをエクスポートする',
      '- 1 冊 1 ページで Markdown に落とす',
      '- タグで横断できるようにする',
    ].join('\n'),
  },
  {
    createdAt: '2026-09-11T09:30:00.000Z',
    title: 'タイトルだけで足りるアイデアもある',
  },
  {
    createdAt: '2026-09-12T04:24:00.000Z',
    title: '聴いていた曲',
    body: 'ブログの記事ページに「この記事を書いたときに聴いていた曲」を載せる。',
  },
]

/**
 * Mock ideas for the dev server. `loadLatest` returns these when `next dev`
 * runs without a Blob token, so the pages have content to style. Timestamps
 * and id suffixes are fixed so permalinks stay stable across reloads, and a
 * fresh array is built on every call so callers cannot change the fixture.
 */
export function mockIdeas(): Idea[] {
  return MOCK_ENTRIES.map((entry, index) => ({
    id: generateIdeaId(
      new Date(entry.createdAt),
      `mock${String(index + 1).padStart(2, '0')}`
    ),
    title: entry.title ?? null,
    body: entry.body ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt ?? entry.createdAt,
  }))
}
