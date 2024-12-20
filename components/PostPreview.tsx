import { useRouter } from 'next/router'
import { Card, DateTime } from 'gymnopedies'

import PostType from '../types/post'

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
    <Card
      heading={<DateTime dateString={date} />}
      title={title}
      image={{ src: url, transition: true }}
      description={excerpt}
      imageCaption={
        <>
          Photo by{' '}
          <a target='_blank' href={providerUrl} rel='noreferrer'>
            {provider}
          </a>
        </>
      }
      onClick={() => router.push(`/posts/${slug}`)}
    ></Card>
  )
}
