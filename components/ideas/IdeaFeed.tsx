import { Content } from '@/components/blog/content'
import { GlobalStyles } from '@/components/blog/global-styles'

export type IdeaFeedItem = {
  id: string
  /** ISO 8601 timestamp, used for the machine-readable `dateTime`. */
  createdAt: string
  /** Pre-formatted display text produced by `formatIdeaTimestamp`. */
  createdAtLabel: string
  /** Sanitized HTML produced by `ideaMarkdownToHtml`. */
  html: string
}

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
            <article className='overflow-hidden rounded-lg bg-card shadow-soft-glow'>
              <header className='px-6 pt-5'>
                <time
                  dateTime={idea.createdAt}
                  className='text-xs tracking-wider text-accent'
                >
                  {idea.createdAtLabel}
                </time>
              </header>
              <Content className='idea-body px-6 pt-3 pb-6 leading-[1.85] [&_p:last-child]:mb-0'>
                <div dangerouslySetInnerHTML={{ __html: idea.html }} />
              </Content>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
