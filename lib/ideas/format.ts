export const IDEAS_TIME_ZONE = 'Asia/Tokyo'

export const EMPTY_EXCERPT = '(本文なし)'

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
