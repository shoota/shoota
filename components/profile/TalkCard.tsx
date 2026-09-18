import { format, parseISO } from 'date-fns'

import { Article } from '@/components/blog/article'
import { Badge } from '@/components/ui/badge'
import { Talk, talkThumbnail } from '@/lib/profile'

/** 登壇資料のカード。ブログ一覧のカードと同じ見た目で、Speaker Deck を別タブで開く */
export const TalkCard: React.FC<{ talk: Talk }> = ({ talk }) => {
  return (
    <a
      href={talk.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex h-full w-full flex-col'
    >
      <Article
        className='h-full max-w-none transition-shadow duration-[1500ms] group-hover:shadow-strong-glow group-focus:shadow-strong-glow'
        badge={
          talk.event ? <Badge variant='secondary'>{talk.event}</Badge> : null
        }
        title={talk.title}
        content={format(parseISO(talk.date), 'yyyy.MM.dd')}
        image={{
          src: talkThumbnail(talk.deckId),
          alt: talk.title,
          caption: `${talk.slides} slides`,
        }}
      />
    </a>
  )
}
