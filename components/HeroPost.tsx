import { useRouter } from 'next/router'

import PostType from '@/types/post'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DateTime } from '@/components/blog/date-time'

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
      <p className='mb-6 text-center text-xs uppercase tracking-[0.3em] text-primary'>
        最新の記事
      </p>
      <button
        type='button'
        onClick={() => router.push(`/posts/${slug}`)}
        className='group block w-full cursor-pointer text-left'
        aria-label={`Read ${title}`}
      >
        <Card className='overflow-hidden transition-shadow group-hover:shadow-strong-glow group-focus:shadow-strong-glow'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title}
            loading='eager'
            className='aspect-[21/9] w-full object-cover opacity-80 grayscale transition duration-700 group-hover:opacity-100 group-hover:grayscale-[30%] group-focus:opacity-100 group-focus:grayscale-[30%]'
          />
          <CardHeader className='gap-3 px-6 pt-6'>
            <div className='flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
              <DateTime dateString={date} formatStr='yyyy.MM.dd' />
            </div>
            <CardTitle className='text-2xl leading-tight text-foreground group-hover:text-primary group-focus:text-primary sm:text-3xl'>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className='px-6 pb-6'>
            <p className='m-0 text-base leading-relaxed text-muted-foreground'>
              {excerpt}
            </p>
            <p className='mt-4 text-xs text-muted-foreground'>
              Photo by{' '}
              <a
                target='_blank'
                href={providerUrl}
                rel='noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='underline decoration-primary underline-offset-4'
              >
                {provider}
              </a>
            </p>
          </CardContent>
        </Card>
      </button>
    </section>
  )
}
