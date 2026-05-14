import { useRouter } from 'next/router'

import PostType from '@/types/post'
import {
  Card,
  CardContent,
  CardFooter,
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
      className='group flex h-full w-full flex-col text-left'
      aria-label={`Read ${title}`}
    >
      <Card className='h-full w-full overflow-hidden transition-shadow group-hover:shadow-soft-glow group-focus:shadow-soft-glow'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          loading='lazy'
          className='aspect-[16/9] w-full object-cover opacity-70 grayscale transition duration-700 group-hover:opacity-100 group-hover:grayscale-[40%] group-focus:opacity-100 group-focus:grayscale-[40%]'
        />
        <CardHeader className='gap-2 pt-4'>
          <DateTime
            dateString={date}
            formatStr='yyyy.MM.dd'
            className='text-xs uppercase tracking-[0.2em]'
          />
          <CardTitle className='text-xl leading-snug text-foreground group-hover:text-primary group-focus:text-primary'>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='m-0 line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
            {excerpt}
          </p>
        </CardContent>
        <CardFooter className='border-t-0 bg-transparent pt-2 pb-4'>
          <div className='flex w-full items-center justify-between text-xs text-muted-foreground'>
            <span>
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
            </span>
            <span className='group-hover:text-primary group-focus:text-primary'>
              Read →
            </span>
          </div>
        </CardFooter>
      </Card>
    </button>
  )
}
