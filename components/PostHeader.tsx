import PostType from '@/types/post'

import { DateTime } from '@/components/blog/date-time'
import { Picture } from '@/components/blog/picture'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  date: string
}

const PostHeader = ({
  title,
  coverImage: { url, provider, providerUrl },
  date,
}: Props) => {
  return (
    <header className='mx-auto mb-10 flex w-full max-w-5xl flex-col items-center gap-6'>
      <h1 className='m-0 text-center text-2xl leading-snug sm:text-3xl md:text-4xl'>
        {title}
      </h1>
      <DateTime
        dateString={date}
        formatStr='yyyy.MM.dd'
        className='text-xs uppercase tracking-[0.2em]'
      />
      <Picture className='w-full'>
        <Picture.Image
          src={url}
          alt={title}
          transition
          className='aspect-[21/9]'
        />
        <Picture.Caption>
          Photo by{' '}
          <a target='_blank' href={providerUrl} rel='noreferrer'>
            {provider}
          </a>
        </Picture.Caption>
      </Picture>
    </header>
  )
}

export default PostHeader
