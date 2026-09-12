import { isIdeaId } from '@/lib/ideas/id'
import { loadLatest } from '@/lib/ideas/store'
import {
  IDEAS_REVALIDATE_SECONDS,
  IdeaView,
  toIdeaView,
} from '@/lib/ideas/view'

export const IDEAS_PATH = '/ideas'

/**
 * Builds the detail page path for an id. Only ids that pass `isIdeaId` are
 * accepted, so a malformed id can never become a revalidation target.
 */
export function ideaPath(id: string): string {
  if (!isIdeaId(id)) {
    throw new Error('ideaPath called with an invalid idea id')
  }
  return `${IDEAS_PATH}/${id}`
}

export type IdeaPageResult =
  | { notFound: true; revalidate: number }
  | { props: { idea: IdeaView }; revalidate: number }

/**
 * `getStaticProps` body for `/ideas/[id]`. An id that fails validation is a
 * 404 before the store is read, so malformed paths never cost a Blob call.
 * An unknown but well-formed id is also a 404; ISR caches that result, which
 * is why the post API revalidates `/ideas/<id>` after saving.
 */
export async function loadIdeaPage(id: unknown): Promise<IdeaPageResult> {
  if (!isIdeaId(id)) {
    return { notFound: true, revalidate: IDEAS_REVALIDATE_SECONDS }
  }
  const ideas = await loadLatest()
  const idea = ideas.find((candidate) => candidate.id === id)
  if (idea === undefined) {
    return { notFound: true, revalidate: IDEAS_REVALIDATE_SECONDS }
  }
  return {
    props: { idea: await toIdeaView(idea) },
    revalidate: IDEAS_REVALIDATE_SECONDS,
  }
}

/**
 * `getStaticPaths` body for `/ideas/[id]`. Ids from the snapshot are filtered
 * through the guard because `isIdea` only requires a non-empty string, and a
 * hand-placed snapshot could carry an id that is not a valid route segment.
 */
export async function listIdeaPaths(): Promise<{ params: { id: string } }[]> {
  const ideas = await loadLatest()
  return ideas
    .map((idea) => idea.id)
    .filter(isIdeaId)
    .map((id) => ({ params: { id } }))
}
