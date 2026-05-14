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

export const HeroPost = ({
  title,
  coverImage: { url, provider, providerUrl },
  date,
  excerpt,
  slug,
}: Props) => {
  const router = useRouter()
  return (
    <section className='mx-auto mb-16 w-full max-w-3xl'>
      <button
        type='button'
        onClick={() => router.push(`/posts/${slug}`)}
        className='group block w-full cursor-pointer text-left'
        aria-label={`Read ${title}`}
      >
        <Article
          size='xl'
          className='max-w-none transition-shadow duration-[1500ms] group-hover:shadow-strong-glow group-focus:shadow-strong-glow'
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
    </section>
  )
}
