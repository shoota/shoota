/**
 * Ordering shared by the feed, the detail page, and the admin list. Kept
 * free of other imports so the browser bundle does not pull in the Markdown
 * pipeline through `view.ts`.
 */
export function sortNewestFirst<T extends { createdAt: string }>(
  ideas: T[]
): T[] {
  return [...ideas].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  )
}
