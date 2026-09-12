import { randomBytes } from 'crypto'

/** Ids are URL- and pathname-safe so they can appear in `/ideas/[id]`. */
export const IDEA_ID_PATTERN = /^[0-9A-Za-z-]+$/

/**
 * Upper bound on id length. Server-generated ids are 26 characters; the cap
 * keeps arbitrarily long request paths from reaching the store.
 */
export const MAX_IDEA_ID_LENGTH = 64

/**
 * Type guard for ids that may be used as a route segment. Both the detail
 * page and the post API run every id through this before building a path.
 */
export function isIdeaId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_IDEA_ID_LENGTH &&
    IDEA_ID_PATTERN.test(value)
  )
}

/**
 * Generates an id that sorts chronologically: a compact UTC timestamp
 * (`20260912T010203456Z`) followed by random hex so that two ideas created in
 * the same millisecond still get distinct ids.
 */
export function generateIdeaId(
  now: Date = new Date(),
  suffix: string = randomBytes(3).toString('hex')
): string {
  const stamp = now.toISOString().replace(/[-:.]/g, '')
  return `${stamp}-${suffix}`
}
