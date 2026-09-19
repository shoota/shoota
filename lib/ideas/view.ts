import { formatIdeaTimestamp } from '@/lib/ideas/format'
import { ideaMarkdownToHtml } from '@/lib/ideas/markdown'
import { Idea } from '@/lib/ideas/types'

/**
 * ISR safety net shared by the feed and the detail page. The post API
 * regenerates both on demand, so this only bounds how stale a page can get
 * when that call fails. It also bounds how long a cached 404 lives on the
 * detail route. The user-facing notices in `IdeaComposer` and `IdeaManager`
 * quote this interval; keep them in sync.
 */
export const IDEAS_REVALIDATE_SECONDS = 60 * 60 * 24

/** Render-ready idea: timestamps formatted and Markdown sanitized. */
export type IdeaView = {
  id: string
  /**
   * Plain text; render it as text, never as HTML. `null` for ideas saved
   * before titles existed.
   */
  title: string | null
  /** ISO 8601 timestamp, used for the machine-readable `dateTime`. */
  createdAt: string
  /** Pre-formatted display text produced by `formatIdeaTimestamp`. */
  createdAtLabel: string
  /**
   * Sanitized HTML produced by `ideaMarkdownToHtml`; empty when the idea
   * has no body.
   */
  html: string
}

export async function toIdeaView(idea: Idea): Promise<IdeaView> {
  return {
    id: idea.id,
    title: idea.title,
    createdAt: idea.createdAt,
    createdAtLabel: formatIdeaTimestamp(idea.createdAt),
    html: idea.body === null ? '' : await ideaMarkdownToHtml(idea.body),
  }
}

export { sortNewestFirst } from '@/lib/ideas/sort'
