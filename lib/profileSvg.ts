/**
 * Profile ページの内容を、セクションごとにフェードイン / アウトしながら
 * 順に見せるアニメーション SVG として描く。GitHub の README は `<img>` 経由の
 * SVG しか動かせないので、JavaScript や外部リソースは使わず、CSS の
 * `@keyframes` とシステムフォントだけで組む。
 */

import {
  CAREER,
  MEDIA,
  PROFILE,
  SKILLS,
  SKILLS_INTRO,
  TALKS,
} from '@/lib/profile'
import { SITE_URL } from '@/lib/constants'

export const WIDTH = 800
export const HEIGHT = 420

/** 1 セクションを見せている秒数（フェードの時間を含む） */
export const SEGMENT_SECONDS = 7
/** フェードイン / アウトそれぞれの秒数 */
export const FADE_SECONDS = 0.9

const COLORS = {
  card: '#04252b',
  cardEdge: '#0a3a42',
  border: 'rgba(207, 216, 222, 0.18)',
  foreground: '#d6d6d6',
  muted: '#999999',
  primary: '#d5ca86',
  accent: '#cfd8de',
  chip: 'rgba(207, 216, 222, 0.10)',
} as const

const FONT_FAMILY = [
  "'Hiragino Sans'",
  "'Hiragino Kaku Gothic ProN'",
  "'Noto Sans JP'",
  "'Noto Sans CJK JP'",
  "'Yu Gothic'",
  'Meiryo',
  '-apple-system',
  "'Segoe UI'",
  'sans-serif',
].join(', ')

/** 右側のコンテンツ領域 */
const CONTENT = { x: 268, y: 40, width: 496, height: HEIGHT - 80 } as const

export const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * 文字幅の見積もり。SVG はブラウザ側で描くので実測できない。全角文字は 1em、
 * 半角は 0.55em、空白は 0.3em として、余白を残して配置する。
 */
export const textWidth = (text: string, fontSize: number): number => {
  let em = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (char === ' ') em += 0.3
    else if (code < 0x2e80) em += 0.55
    else em += 1
  }
  return em * fontSize
}

/**
 * 折り返し単位。日本語は 1 文字ずつ、英数字の連なりは 1 語として扱う。
 * 空白は語の区切りで、行頭には残さない。
 */
const tokenize = (text: string): string[] => {
  const tokens: string[] = []
  let word = ''
  const flush = () => {
    if (word) tokens.push(word)
    word = ''
  }
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (char === ' ') {
      flush()
      tokens.push(' ')
    } else if (code < 0x2e80) {
      word += char
    } else {
      flush()
      tokens.push(char)
    }
  }
  flush()
  return tokens
}

/** `maxWidth` に収まるように詰め込み、行の配列を返す */
export const wrapLines = (
  text: string,
  maxWidth: number,
  fontSize: number
): string[] => {
  const lines: string[] = []
  let line = ''
  for (const token of tokenize(text)) {
    if (token === ' ' && line === '') continue
    const candidate = line + token
    if (textWidth(candidate, fontSize) <= maxWidth || line === '') {
      line = candidate
    } else {
      lines.push(line.trimEnd())
      line = token === ' ' ? '' : token
    }
  }
  if (line.trimEnd()) lines.push(line.trimEnd())
  return lines
}

/** 1 行に収まらない文字列を「…」で切る */
export const truncate = (
  text: string,
  maxWidth: number,
  fontSize: number
): string => {
  if (textWidth(text, fontSize) <= maxWidth) return text
  const ellipsis = '…'
  const budget = maxWidth - textWidth(ellipsis, fontSize)
  let kept = ''
  for (const char of text) {
    if (textWidth(kept + char, fontSize) > budget) break
    kept += char
  }
  return kept.trimEnd() + ellipsis
}

type TextOptions = {
  size: number
  fill?: string
  weight?: 'normal' | 'bold'
  anchor?: 'start' | 'middle' | 'end'
  letterSpacing?: number
}

const text = (
  x: number,
  y: number,
  value: string,
  { size, fill = COLORS.foreground, weight, anchor, letterSpacing }: TextOptions
): string => {
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-size="${size}"`,
    `fill="${fill}"`,
    weight ? `font-weight="${weight}"` : '',
    anchor ? `text-anchor="${anchor}"` : '',
    letterSpacing ? `letter-spacing="${letterSpacing}"` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return `<text ${attrs}>${escapeXml(value)}</text>`
}

/** 複数行の段落。使った高さを返すので、呼び出し側で y を進める */
const paragraph = (
  x: number,
  y: number,
  value: string,
  size: number,
  lineHeight: number,
  fill = COLORS.foreground,
  maxLines = Infinity
): { markup: string; height: number } => {
  let lines = wrapLines(value, CONTENT.x + CONTENT.width - x, size)
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    lines[maxLines - 1] = truncate(
      lines[maxLines - 1] + '…',
      CONTENT.x + CONTENT.width - x,
      size
    )
  }
  const markup = lines
    .map((line, index) => text(x, y + index * lineHeight, line, { size, fill }))
    .join('')
  return { markup, height: lines.length * lineHeight }
}

/** 角丸の小さなバッジ。幅は文字幅から見積もる */
const chip = (
  x: number,
  y: number,
  label: string,
  size: number,
  fill: string,
  stroke: string,
  textFill: string
): { markup: string; width: number } => {
  const paddingX = 9
  const height = size + 10
  const width = Math.ceil(textWidth(label, size) + paddingX * 2)
  const markup =
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${fill}" stroke="${stroke}"/>` +
    text(x + width / 2, y + height / 2 + size * 0.36, label, {
      size,
      fill: textFill,
      anchor: 'middle',
    })
  return { markup, width }
}

/** セクションの見出し。Profile ページの ProfileSection のラベルに合わせる */
const sectionLabel = (label: string): string =>
  text(CONTENT.x, CONTENT.y + 14, label.toUpperCase(), {
    size: 12,
    fill: COLORS.primary,
    weight: 'bold',
    letterSpacing: 2.4,
  }) +
  `<line x1="${CONTENT.x}" y1="${CONTENT.y + 26}" x2="${CONTENT.x + CONTENT.width}" y2="${CONTENT.y + 26}" stroke="${COLORS.border}"/>`

const BODY_TOP = CONTENT.y + 52

const aboutSection = (): string => {
  let y = BODY_TOP
  const parts: string[] = []
  for (const sentence of PROFILE.intro) {
    const { markup, height } = paragraph(CONTENT.x, y, sentence, 14, 23)
    parts.push(markup)
    y += height + 4
  }
  y += 10
  for (const fact of PROFILE.facts) {
    parts.push(text(CONTENT.x, y, fact, { size: 13, fill: COLORS.accent }))
    y += 22
  }
  parts.push(
    text(CONTENT.x, y + 4, PROFILE.motto, { size: 13, fill: COLORS.muted })
  )
  return parts.join('')
}

const skillsSection = (): string => {
  let y = BODY_TOP
  const parts: string[] = []
  for (const sentence of SKILLS_INTRO) {
    const { markup, height } = paragraph(
      CONTENT.x,
      y,
      sentence,
      13,
      21,
      COLORS.foreground,
      3
    )
    parts.push(markup)
    y += height + 3
  }
  return parts.join('')
}

const stackSection = (): string => {
  const parts: string[] = []
  parts.push(
    text(CONTENT.x, BODY_TOP, 'おもな技術スタック', {
      size: 13,
      fill: COLORS.accent,
    })
  )
  let x = CONTENT.x
  let y = BODY_TOP + 20
  const gap = 8
  for (const skill of SKILLS) {
    const width = Math.ceil(textWidth(skill, 13) + 18)
    if (x + width > CONTENT.x + CONTENT.width) {
      x = CONTENT.x
      y += 23 + gap
    }
    const { markup } = chip(
      x,
      y,
      skill,
      13,
      COLORS.chip,
      COLORS.border,
      COLORS.accent
    )
    parts.push(markup)
    x += width + gap
  }
  return parts.join('')
}

const talksSection = (): string => {
  let y = BODY_TOP
  const parts: string[] = []
  for (const talk of TALKS) {
    parts.push(
      text(CONTENT.x, y, truncate(talk.title, CONTENT.width, 14), {
        size: 14,
        fill: COLORS.foreground,
      })
    )
    const meta = [talk.date, talk.event, `${talk.slides} slides`]
      .filter(Boolean)
      .join('  ·  ')
    parts.push(text(CONTENT.x, y + 18, meta, { size: 11, fill: COLORS.muted }))
    y += 50
  }
  return parts.join('')
}

const careerSection = (): string => {
  let y = BODY_TOP
  const parts: string[] = []
  for (const entry of CAREER) {
    const headFill = entry.current ? COLORS.primary : COLORS.accent
    parts.push(
      text(CONTENT.x, y, entry.period, { size: 12, fill: COLORS.muted })
    )
    const head = entry.role ? `${entry.place}  /  ${entry.role}` : entry.place
    parts.push(
      text(CONTENT.x + 100, y, truncate(head, CONTENT.width - 100, 14), {
        size: 14,
        fill: headFill,
        weight: entry.current ? 'bold' : 'normal',
      })
    )
    parts.push(
      text(
        CONTENT.x + 100,
        y + 19,
        truncate(entry.items.join(' / '), CONTENT.width - 100, 11),
        { size: 11, fill: COLORS.muted }
      )
    )
    y += 56
  }
  return parts.join('')
}

const mediaSection = (): string => {
  let y = BODY_TOP
  const parts: string[] = []
  for (const entry of MEDIA) {
    const { markup, width } = chip(
      CONTENT.x,
      y - 14,
      entry.kind,
      11,
      'transparent',
      COLORS.primary,
      COLORS.primary
    )
    parts.push(markup)
    parts.push(
      text(CONTENT.x + width + 12, y, entry.date, {
        size: 11,
        fill: COLORS.muted,
      })
    )
    const { markup: title, height } = paragraph(
      CONTENT.x,
      y + 28,
      entry.title,
      14,
      22,
      COLORS.foreground,
      2
    )
    parts.push(title)
    parts.push(
      text(CONTENT.x, y + 28 + height + 2, entry.source, {
        size: 11,
        fill: COLORS.muted,
      })
    )
    y += 28 + height + 36
  }
  return parts.join('')
}

export type Section = { label: string; body: string }

/** 見せる順番。Profile ページの並びに「About」と「Stack」を足したもの */
export const buildSections = (): Section[] => [
  { label: 'About', body: aboutSection() },
  { label: 'Skills', body: skillsSection() },
  { label: 'Stack', body: stackSection() },
  { label: 'Talks', body: talksSection() },
  { label: 'Career', body: careerSection() },
  { label: 'Media', body: mediaSection() },
]

/** 1 周の秒数 */
export const cycleSeconds = (sectionCount: number): number =>
  sectionCount * SEGMENT_SECONDS

/**
 * 1 周ぶんの keyframes。すべてのセクションが同じ keyframes を使い、
 * `animation-delay` だけをずらす。両端が 0 なので fill-mode は要らない。
 */
const buildKeyframes = (cycle: number): string => {
  const pct = (seconds: number) => ((seconds / cycle) * 100).toFixed(3)
  return [
    '@keyframes fade {',
    `  0% { opacity: 0; transform: translateY(6px); }`,
    `  ${pct(FADE_SECONDS)}% { opacity: 1; transform: translateY(0); }`,
    `  ${pct(SEGMENT_SECONDS - FADE_SECONDS)}% { opacity: 1; transform: translateY(0); }`,
    `  ${pct(SEGMENT_SECONDS)}% { opacity: 0; transform: translateY(-6px); }`,
    '  100% { opacity: 0; transform: translateY(-6px); }',
    '}',
    '@keyframes dot {',
    '  0% { fill: rgba(207, 216, 222, 0.22); }',
    `  ${pct(FADE_SECONDS)}% { fill: ${COLORS.primary}; }`,
    `  ${pct(SEGMENT_SECONDS - FADE_SECONDS)}% { fill: ${COLORS.primary}; }`,
    `  ${pct(SEGMENT_SECONDS)}% { fill: rgba(207, 216, 222, 0.22); }`,
    '  100% { fill: rgba(207, 216, 222, 0.22); }',
    '}',
  ].join('\n')
}

const buildStyle = (sectionCount: number): string => {
  const cycle = cycleSeconds(sectionCount)
  const delays = Array.from({ length: sectionCount }, (_, index) =>
    [
      `.s${index} { animation-delay: ${index * SEGMENT_SECONDS}s; }`,
      `.d${index} { animation-delay: ${index * SEGMENT_SECONDS}s; }`,
    ].join('\n')
  ).join('\n')
  return [
    `text { font-family: ${FONT_FAMILY}; }`,
    `.section { opacity: 0; animation: fade ${cycle}s linear infinite; }`,
    `.dot { fill: rgba(207, 216, 222, 0.22); animation: dot ${cycle}s linear infinite; }`,
    delays,
    buildKeyframes(cycle),
    '@media (prefers-reduced-motion: reduce) {',
    '  .section, .dot { animation: none; }',
    '  .s0 { opacity: 1; }',
    `  .d0 { fill: ${COLORS.primary}; }`,
    '}',
  ].join('\n')
}

/** 左側。常に表示される名前とアバター */
const buildHeader = (avatarDataUri: string | null): string => {
  const cx = 134
  const cy = 128
  const r = 64
  const avatar = avatarDataUri
    ? `<image href="${avatarDataUri}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.chip}"/>` +
      text(cx, cy + 12, 'SK', {
        size: 34,
        fill: COLORS.accent,
        anchor: 'middle',
        weight: 'bold',
      })
  return [
    `<defs><clipPath id="avatar"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>`,
    `<circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="none" stroke="${COLORS.border}"/>`,
    avatar,
    text(cx, 230, PROFILE.name, {
      size: 22,
      fill: COLORS.accent,
      weight: 'bold',
      anchor: 'middle',
    }),
    text(cx, 252, PROFILE.nameJa, {
      size: 13,
      fill: COLORS.accent,
      anchor: 'middle',
    }),
    text(cx, 280, `@${PROFILE.handle}`, {
      size: 13,
      fill: COLORS.foreground,
      anchor: 'middle',
    }),
    text(cx, HEIGHT - 28, SITE_URL.replace(/^https?:\/\//, '') + '/profile', {
      size: 11,
      fill: COLORS.muted,
      anchor: 'middle',
    }),
    `<line x1="${CONTENT.x - 28}" y1="40" x2="${CONTENT.x - 28}" y2="${HEIGHT - 40}" stroke="${COLORS.border}"/>`,
  ].join('')
}

/** 下側の進捗ドット。表示中のセクションだけ色が付く */
const buildDots = (sectionCount: number): string => {
  const spacing = 16
  const startX = CONTENT.x + CONTENT.width - (sectionCount - 1) * spacing
  return Array.from(
    { length: sectionCount },
    (_, index) =>
      `<circle class="dot d${index}" cx="${startX + index * spacing}" cy="${HEIGHT - 28}" r="3.5"/>`
  ).join('')
}

export type RenderOptions = {
  /** `data:image/jpeg;base64,...` の形。無ければイニシャルで代える */
  avatarDataUri?: string | null
}

export const renderProfileSvg = ({
  avatarDataUri = null,
}: RenderOptions = {}): string => {
  const sections = buildSections()
  const title = `${PROFILE.name} (@${PROFILE.handle}) のプロフィール`
  const sectionMarkup = sections
    .map(
      (section, index) =>
        `<g class="section s${index}">${sectionLabel(section.label)}${section.body}</g>`
    )
    .join('')
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title">`,
    `<title id="title">${escapeXml(title)}</title>`,
    `<style><![CDATA[\n${buildStyle(sections.length)}\n]]></style>`,
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${COLORS.cardEdge}"/><stop offset="1" stop-color="${COLORS.card}"/></linearGradient></defs>`,
    `<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="16" fill="url(#bg)" stroke="${COLORS.border}"/>`,
    buildHeader(avatarDataUri),
    sectionMarkup,
    buildDots(sections.length),
    '</svg>',
  ].join('\n')
}
