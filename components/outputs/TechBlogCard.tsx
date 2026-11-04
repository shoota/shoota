import { format, parseISO } from 'date-fns'

import { Article } from '@/components/blog/article'
import { Badge } from '@/components/ui/badge'
import { TECH_BLOG_NAME, TechBlogArticle } from '@/lib/techBlog'

/** Findy Tech Blog に書いた記事のカード。アイキャッチがあれば登壇カードと同じ枠で見せる */
export const TechBlogCard: React.FC<{ article: TechBlogArticle }> = ({
  article,
}) => {
  return (
    <a
      href={article.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex h-full w-full flex-col'
    >
      <Article
        className='h-full max-w-none transition-shadow duration-[1500ms] group-hover:shadow-strong-glow group-focus:shadow-strong-glow'
        badge={<Badge variant='secondary'>{TECH_BLOG_NAME}</Badge>}
        title={article.title}
        content={format(parseISO(article.date), 'yyyy.MM.dd')}
        image={
          article.image ? { src: article.image, alt: article.title } : undefined
        }
      />
    </a>
  )
}
