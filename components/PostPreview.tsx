import { useRouter } from 'next/router'
import { format, parseISO } from 'date-fns'

import PostType from '@/types/post'
import { Article } from '@/components/blog/article'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  date: string
  excerpt: string
  slug: string
}

export const PostPreview: React.FC<Props> = ({
  title,
  coverImage: { url, provider, providerUrl },
  date,
  excerpt,
  slug,
}) => {
  const router = useRouter()
  return (
    <button
      type='button'
      onClick={() => router.push(`/posts/${slug}`)}
      className='group flex h-full w-full cursor-pointer flex-col text-left'
      aria-label={`Read ${title}`}
    >
      <Article
        className='h-full max-w-none transition-shadow duration-[1500ms] group-hover:shadow-soft-glow group-focus:shadow-soft-glow'
        title={title}
        description={excerpt}
        content={format(parseISO(date), 'yyyy.MM.dd')}
        image={{
          src: url,
          alt: title,
          caption: (
            <>
              Photo by{' '}
              <a
                target='_blank'
                href={providerUrl}
                rel='noreferrer'
                onClick={(e) => e.stopPropagation()}
              >
                {provider}
              </a>
            </>
          ),
        }}
      />
    </button>
  )
}
