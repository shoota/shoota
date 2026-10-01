export const IDEAS_TIME_ZONE = 'Asia/Tokyo'

export const EMPTY_EXCERPT = '(本文なし)'

/** Upper bound on `ideaDescription`, counted in characters. */
export const MAX_DESCRIPTION_LENGTH = 120

/** Shown in the admin list for ideas saved before titles existed. */
export const UNTITLED_LABEL = '(タイトルなし)'

/**
 * The first non-empty line of a Markdown body with any heading marker
 * removed, used as a one-line caption in the admin list. `null` (an idea
 * posted without a body) falls back like an empty body.
 */
export function ideaExcerpt(body: string | null): string {
  const line = (body ?? '')
    .split('\n')
    .map((part) => part.replace(/^#+\s*/, '').trim())
    .find((part) => part.length > 0)
  return line ?? EMPTY_EXCERPT
}

/**
 * Removes the Markdown markers that can appear on one line so it reads as
 * plain text: block prefixes (headings, quotes, list bullets, task boxes),
 * images and links (kept as their text), inline HTML, emphasis, and code
 * spans. A line
 * that is only a code fence or a horizontal rule becomes empty.
 */
function markdownLineToText(line: string): string {
  return line
    .replace(/^\s*(?:```.*|~~~.*|[-*_]{3,}\s*)$/, '')
    .replace(/^\s*(?:#{1,6}\s*|>\s*|[-*+]\s+|\d+[.)]\s+|\[[ xX]\]\s+)+/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/(^|[^\w*])\*(\S(?:.*?\S)?)\*(?!\w)/g, '$1$2')
    .replace(/(^|[^\w_])_(\S(?:.*?\S)?)_(?!\w)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * One-line plain-text summary for `<meta name="description">` and the Open
 * Graph description: the first line of the body that still has text once
 * its Markdown markers are removed, cut to `MAX_DESCRIPTION_LENGTH`
 * characters with an ellipsis. `null` when the idea has no body, so the page
 * falls back to the site-wide description. Unlike `ideaExcerpt` this never
 * returns a placeholder, and it strips inline markup, because the result is
 * shown outside the site where `**bold**` would be read literally.
 */
export function ideaDescription(body: string | null): string | null {
  const line = (body ?? '')
    .split('\n')
    .map(markdownLineToText)
    .find((part) => part.length > 0)
  if (line === undefined) {
    return null
  }
  const chars = Array.from(line)
  if (chars.length <= MAX_DESCRIPTION_LENGTH) {
    return line
  }
  return `${chars
    .slice(0, MAX_DESCRIPTION_LENGTH - 1)
    .join('')
    .trimEnd()}…`
}

/**
 * Title for the detail page's `<title>` and Open Graph tags. Ideas saved
 * before titles existed fall back to their timestamp label. Lives here, not
 * in `view.ts`, so the page bundle does not pull in the Markdown pipeline.
 */
export function ideaPageTitle(idea: {
  title: string | null
  createdAtLabel: string
}): string {
  return idea.title ?? `Idea ${idea.createdAtLabel}`
}

/**
 * Formats an ISO timestamp as `yyyy.MM.dd HH:mm` in a fixed time zone.
 * Formatting happens in `getStaticProps`, so the markup is identical on the
 * server and in the browser regardless of where either one runs.
 */
export function formatIdeaTimestamp(
  iso: string,
  timeZone: string = IDEAS_TIME_ZONE
): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  } as Intl.DateTimeFormatOptions).formatToParts(new Date(iso))
  const get = (type: string) =>
    parts.filter((part) => part.type === type)[0]?.value ?? ''
  return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`
}
