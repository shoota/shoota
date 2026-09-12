import { GlobalStyles } from '@/components/blog/global-styles'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import type { IdeaView } from '@/lib/ideas/view'

/** Kept as an alias so the feed's prop type has a name of its own. */
export type IdeaFeedItem = IdeaView

type Props = {
  ideas: IdeaFeedItem[]
}

export const IdeaFeed: React.FC<Props> = ({ ideas }) => {
  if (ideas.length === 0) {
    return (
      <p className='mx-auto max-w-3xl text-center text-sm text-muted-foreground'>
        まだアイデアはありません。
      </p>
    )
  }
  return (
    <section className='mx-auto w-full max-w-3xl'>
      <GlobalStyles scope='.idea-body' />
      <ul className='m-0 flex list-none flex-col gap-8 p-0'>
        {ideas.map((idea) => (
          <li key={idea.id} className='m-0 p-0'>
            <IdeaCard idea={idea} href={`/ideas/${idea.id}`} />
          </li>
        ))}
      </ul>
    </section>
  )
}
