/**
 * Profile ページに並べる内容。文章ではなく短い項目の集まりとして持つ。
 */

export type CareerEntry = {
  /** 期間（西暦）。在籍中のものは「2023 – 現在」のように書く */
  period: string
  /** 社名、または社名を伏せた業態 */
  place: string
  /** 社名の横に小さく添える役割 */
  role?: string
  items: string[]
  /** いまの所属。これ以外は文字色を落として見せる */
  current?: boolean
}

export type Talk = {
  title: string
  url: string
  /** Speaker Deck のプレゼンテーション ID（サムネイルの URL に使う） */
  deckId: string
  /** 公開日 (yyyy-MM-dd) */
  date: string
  slides: number
}

export const PROFILE = {
  name: 'Shuta Kumano',
  nameJa: '熊野 修太',
  handle: 'shoota',
  picture: '/assets/img/avt.jpg',
  facts: ['ファインディ株式会社 / フロントエンドリード'],
  motto: '座右の銘 : 見る前に飛べ / Leap before you Look',
  /** もともと Profile に載せていた自己紹介。文のまとまりごとに分けて持つ */
  intro: [
    '1984年、青森県うまれです。',
    '学生時代はカメラと遺伝生物学をこよなく愛していましたが、なぜかカメラメーカーのエンジニアとして社会にでました。',
    '東日本大震災をきっかけに地元での暮らしを願うようになり、青森へ転職＆移住しました。',
    '現在はフルリモートワーカーとして自宅でエンジニアをしています。',
    '3人の息子と1人の嫁さんと暮らしています。もういちどいぬを飼いたいです。',
  ],
}

export const CAREER: CareerEntry[] = [
  {
    period: '2023 – 現在',
    place: 'ファインディ株式会社',
    role: 'フロントエンドリード',
    current: true,
    items: ['プロダクト開発部 Findy Team+ 開発', 'CTO室 開発推進'],
  },
  {
    period: '2019 – 2022',
    place: '株式会社グロービス',
    items: [
      '法人向け学習・研修管理システム (LMS) の開発',
      'フロントエンドエンジニア',
      'プロダクト開発リード / フロントエンド横断リード',
      'エンジニアリングマネージャー',
    ],
  },
  {
    period: '2017 – 2019',
    place: 'Web 分析サービスの会社',
    items: [
      'サイト改善のための分析サービスの開発',
      'サーバサイド / フロントエンド',
      '分析ツールや AB テストの導入・運用支援',
    ],
  },
  {
    period: '2014 – 2017',
    place: '受託開発の会社',
    items: [
      'Android / iOS アプリケーション',
      'REST API サーバー',
      'Bluetooth (BLE) / NFC 通信',
    ],
  },
  {
    period: '2009 – 2014',
    place: 'メーカー系の開発会社',
    items: [
      'コンシューマ向け Web サービスの開発・保守',
      '技術標準化と技術選定',
      '研究開発のチームリーダー',
    ],
  },
]

/** Skills の冒頭に置く説明。1 文ずつ分けて持ち、1 文を 1 行として並べる */
export const SKILLS_INTRO = [
  '主にReact / TypeScriptをメインとしたSPA、フロントエンドの開発と開発環境の治安維持が得意です。',
  'Apollo Clientなどを利用したGraphQL APIの設計、データライフサイクルとレンダリングの設計、グローバルな状態管理などReactエコシステムを用いたフロントエンドの設計全般をしてきました。',
  'フロントエンドのテストをこよなく愛し、Linterや各種自動化によるコード品質の維持、分離設計、コーディングスタイルのメンテナンスなどもします。',
  '多言語化したフロントエンドのメンテナンス管理も詳しいです。',
  'またNxを利用したモノレポ構築やUI Componentとロジック層の分離などコードアーキテクチャの改善、CIチューニングや大規模な改善計画でも効果的なはたらきができます。',
]

export const SKILLS = [
  'React',
  'TypeScript / JavaScript',
  'Python',
  'Java',
  'PHP',
  'Swift / Objective-C',
  'Android App(Java)',
  'Scrum',
  'TDD / BDD',
  'ペア・モブプログラミング',
  'チケット駆動開発',
]

export const TALKS: Talk[] = [
  {
    title: '不要なレビューをAIにまかせて AIコーディングの環境改善を加速した',
    url: 'https://speakerdeck.com/shoota/approve-from-ai-with-tidying-change-f72da107-b24b-4b68-a494-762fed93943e',
    deckId: 'ab4dddb85f1a4d07a47d3ff54a7626a1',
    date: '2026-06-24',
    slides: 22,
  },
  {
    title: '組織の中で自分を経営する技術',
    url: 'https://speakerdeck.com/shoota/art-of-self-management',
    deckId: 'ba49da85e7ce45d8aa3ba19ab387422d',
    date: '2026-05-27',
    slides: 26,
  },
  {
    title:
      '大規模モノレポの秩序管理 失速しない多言語化フロントエンドの運用 / JSConf JP 2025',
    url: 'https://speakerdeck.com/shoota/da-gui-mo-monoreponozhi-xu-guan-li-shi-su-sinaiduo-yan-yu-hua-hurontoendonoyun-yong',
    deckId: '604def4c3d8f4b49b1975bec91f10bd9',
    date: '2025-11-16',
    slides: 64,
  },
  {
    title: 'AIの個性を理解し、指揮する',
    url: 'https://speakerdeck.com/shoota/ai-characteristic',
    deckId: 'f42c257808e7421190b96b22d991898e',
    date: '2025-10-29',
    slides: 18,
  },
  {
    title: '開発生産性向上！ 育成を「改善」と捉えるエンジニア育成戦略',
    url: 'https://speakerdeck.com/shoota/growth-engineer',
    deckId: 'cdf74a17686a4f1e86de14e25b785021',
    date: '2024-12-05',
    slides: 15,
  },
  {
    title:
      '自己改善からチームを動かす！ 「セルフエンジニアリングマネージャー」のすゝめ',
    url: 'https://speakerdeck.com/shoota/zi-ji-gai-shan-karatimuwodong-kasu-seruhuenziniaringumaneziya-nosu-me',
    deckId: 'f6a8658e814a484c9f7e9a553e519490',
    date: '2024-04-22',
    slides: 26,
  },
]

export const talkThumbnail = (deckId: string) =>
  `https://files.speakerdeck.com/presentations/${deckId}/preview_slide_0.jpg`
