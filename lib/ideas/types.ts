/**
 * A single idea. `title` is plain text and must be rendered as text, never
 * as HTML. `body` is Markdown authored at runtime, so it must go through the
 * sanitizing pipeline in `lib/ideas/markdown.ts` before render. Timestamps
 * are ISO 8601 strings in UTC.
 *
 * Both `title` and `body` are nullable in the stored data. The admin form
 * requires a title, so every idea posted or edited through it has one; ideas
 * saved before titles existed have `null` (or no field at all in the
 * snapshot) until they are fixed by hand or edited. A body is optional, so
 * an idea posted with a blank body stores `null`.
 */
export type Idea = {
  id: string
  title: string | null
  body: string | null
  createdAt: string
  updatedAt: string
}

/** Upper bound on a title, counted after `normalizeTitle`. */
export const MAX_TITLE_LENGTH = 100

/**
 * Collapses every run of whitespace, line breaks included, into one space
 * and trims the ends, so a title is always a single line. The API stores
 * titles in this form and the admin page validates against it.
 */
export function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim()
}

/**
 * A blank body is stored as `null`; anything else is kept exactly as sent,
 * because whitespace can be meaningful in Markdown. The API stores bodies in
 * this form and the admin page mirrors it in its list.
 */
export function normalizeBody(body: string): string | null {
  return body.trim().length > 0 ? body : null
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string'
}

/**
 * Parses one snapshot entry into an `Idea`, or returns `undefined` for
 * anything that is not one. Timestamps must parse as dates, because a string
 * that merely looks like one would pass the type check and then throw while
 * formatting during render. A missing or `null` title or body becomes
 * `null`, so ideas saved before titles existed are not dropped (and then
 * lost on the next save). Unknown fields are not carried over.
 */
export function parseIdea(value: unknown): Idea | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }
  const record = value as Record<string, unknown>
  if (
    typeof record.id !== 'string' ||
    record.id.length === 0 ||
    !isNullableString(record.title) ||
    !isNullableString(record.body) ||
    !isDateString(record.createdAt) ||
    !isDateString(record.updatedAt)
  ) {
    return undefined
  }
  return {
    id: record.id,
    title: record.title ?? null,
    body: record.body ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

/** `parseIdea` over a list, dropping the entries that are not ideas. */
export function parseIdeas(values: unknown[]): Idea[] {
  const ideas: Idea[] = []
  for (const value of values) {
    const idea = parseIdea(value)
    if (idea !== undefined) {
      ideas.push(idea)
    }
  }
  return ideas
}
