import { randomBytes } from 'crypto'

/** Ids are URL- and pathname-safe so they can appear in `/ideas/[id]`. */
export const IDEA_ID_PATTERN = /^[0-9A-Za-z-]+$/

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
