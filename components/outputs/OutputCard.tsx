import { MediaCard } from '@/components/outputs/MediaCard'
import { TalkCard } from '@/components/outputs/TalkCard'
import { TechBlogCard } from '@/components/outputs/TechBlogCard'
import type { OutputEntry } from '@/lib/outputs'

/** 発信 1 件を種別に合ったカードで描く */
export const OutputCard: React.FC<{ entry: OutputEntry }> = ({ entry }) => {
  switch (entry.kind) {
    case 'talk':
      return <TalkCard talk={entry.talk} />
    case 'media':
      return <MediaCard entry={entry.media} />
    case 'article':
      return <TechBlogCard article={entry.article} />
  }
}
