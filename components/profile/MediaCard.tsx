import { format, parseISO } from 'date-fns'

import { Article } from '@/components/blog/article'
import { Badge } from '@/components/ui/badge'
import { MediaEntry } from '@/lib/profile'

/**
 * Podcast や取材記事のカード。番組のカバー画像は正方形で 16:9 の枠では切れて
 * しまうので、画像は持たせず、種別のバッジと文字だけで見せる。
 */
export const MediaCard: React.FC<{ entry: MediaEntry }> = ({ entry }) => {
  return (
    <a
      href={entry.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex h-full w-full flex-col'
    >
      <Article
        className='h-full max-w-none transition-shadow duration-[1500ms] group-hover:shadow-strong-glow group-focus:shadow-strong-glow'
        badge={<Badge variant='secondary'>{entry.kind}</Badge>}
        title={entry.title}
        description={entry.source}
        content={format(parseISO(entry.date), 'yyyy.MM.dd')}
      />
    </a>
  )
}
