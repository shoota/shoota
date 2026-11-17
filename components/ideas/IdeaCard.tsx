import Link from 'next/link'
import { useRouter } from 'next/router'

import { Content } from '@/components/blog/content'
import {
  CARD_INTERACTIVE_SELECTOR,
  shouldOpenCard,
} from '@/lib/ideas/cardClick'
import type { IdeaView } from '@/lib/ideas/view'
import { cn } from '@/lib/utils'

type Props = {
  idea: IdeaView
  /**
   * When set, the timestamp becomes a permalink to this path and a click
   * anywhere else on the card opens it too. The body can contain sanitized
   * links of its own and should stay selectable, so the card is not wrapped
   * in (or covered by) an anchor: a click handler navigates instead, and the
   * timestamp stays the real link for keyboards and new-tab clicks.
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
  const router = useRouter()
  const time = (
    <time dateTime={idea.createdAt} className='text-xs tracking-wider'>
      {idea.createdAtLabel}
    </time>
  )
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (href === undefined) return
    const { target } = event
    const open = shouldOpenCard({
      defaultPrevented: event.defaultPrevented,
      button: event.button,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      onInteractive:
        target instanceof Element &&
        target.closest(CARD_INTERACTIVE_SELECTOR) !== null,
      hasSelection: window.getSelection()?.isCollapsed === false,
    })
    if (open) void router.push(href)
  }
  return (
    <article
      onClick={href === undefined ? undefined : handleClick}
      className={cn(
        'overflow-hidden rounded-lg bg-card px-6 pt-5 pb-6 shadow-soft-glow',
        href !== undefined &&
          'cursor-pointer ring-1 ring-transparent transition-shadow hover:ring-primary/40'
      )}
    >
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
