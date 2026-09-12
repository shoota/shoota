import { formatIdeaTimestamp } from '@/lib/ideas/format'
import { ideaMarkdownToHtml } from '@/lib/ideas/markdown'
import { Idea } from '@/lib/ideas/types'

/**
 * ISR safety net shared by the feed and the detail page. The post API
 * regenerates both on demand, so this only bounds how stale a page can get
 * when that call fails.
 */
export const IDEAS_REVALIDATE_SECONDS = 3600

/** Render-ready idea: timestamps formatted and Markdown sanitized. */
export type IdeaView = {
  id: string
  /** ISO 8601 timestamp, used for the machine-readable `dateTime`. */
  createdAt: string
  /** Pre-formatted display text produced by `formatIdeaTimestamp`. */
  createdAtLabel: string
  /** Sanitized HTML produced by `ideaMarkdownToHtml`. */
  html: string
}

export async function toIdeaView(idea: Idea): Promise<IdeaView> {
  return {
    id: idea.id,
    createdAt: idea.createdAt,
    createdAtLabel: formatIdeaTimestamp(idea.createdAt),
    html: await ideaMarkdownToHtml(idea.body),
  }
}

/** Returns a copy ordered newest first. */
export function sortNewestFirst(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  )
}
