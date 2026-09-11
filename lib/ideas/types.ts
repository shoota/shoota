/**
 * A single idea. `body` is Markdown authored at runtime, so it must go
 * through the sanitizing pipeline in `lib/ideas/markdown.ts` before render.
 * Timestamps are ISO 8601 strings in UTC.
 */
export type Idea = {
  id: string
  body: string
  createdAt: string
  updatedAt: string
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

/**
 * Type guard for snapshot entries. Timestamps must parse as dates, because a
 * string that merely looks like one would pass the type check and then throw
 * while formatting during render.
 */
export function isIdea(value: unknown): value is Idea {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.body === 'string' &&
    isDateString(record.createdAt) &&
    isDateString(record.updatedAt)
  )
}
