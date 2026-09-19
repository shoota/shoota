import Link from 'next/link'

import { Content } from '@/components/blog/content'
import type { IdeaView } from '@/lib/ideas/view'

type Props = {
  idea: IdeaView
  /**
   * When set, the timestamp becomes a permalink to this path. The body can
   * contain sanitized links of its own, so the whole card is never a link.
   */
  href?: string
}

/**
 * One idea as a card. The page that renders it must also render
 * `<GlobalStyles scope='.idea-body' />` once so the Markdown output is styled.
 * The title is plain text and is rendered as text; only the body is HTML.
 * Either may be absent: ideas saved before titles existed have no title, and
 * an idea posted with a blank body has no body.
 */
export const IdeaCard: React.FC<Props> = ({ idea, href }) => {
  const time = (
    <time dateTime={idea.createdAt} className='text-xs tracking-wider'>
      {idea.createdAtLabel}
    </time>
  )
  return (
    <article className='overflow-hidden rounded-lg bg-card px-6 pt-5 pb-6 shadow-soft-glow'>
      <header className='text-accent'>
        {href === undefined ? (
          time
        ) : (
          <Link
            href={href}
            className='no-underline hover:text-primary hover:underline hover:underline-offset-4'
          >
            {time}
          </Link>
        )}
      </header>
      {idea.title !== null && (
        <h3 className='mt-3 mb-0 text-lg font-bold leading-snug text-foreground'>
          {idea.title}
        </h3>
      )}
      {idea.html.length > 0 && (
        <Content className='idea-body mt-3 p-0 leading-[1.85] [&_p:last-child]:mb-0'>
          <div dangerouslySetInnerHTML={{ __html: idea.html }} />
        </Content>
      )}
    </article>
  )
}
