import { useRouter } from 'next/router'

import PostType from '../types/post'
import { Card, DateTime } from 'gymnopedies'
import styled from '@emotion/styled'

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
    <Container>
      <Card
        transition
        heading={<DateTime dateString={date} />}
        title={title}
        image={{ src: url }}
        description={excerpt}
        width='90vw'
        maxWidth='800px'
        imageCaption={
          <>
            Photo by{' '}
            <a target='_blank' href={providerUrl} rel='noreferrer'>
              {provider}
            </a>
          </>
        }
        onClick={() => router.push(`/posts/${slug}`)}
      >
        <Caption>最新の記事</Caption>
      </Card>
    </Container>
  )
}

const Caption = styled.p`
  text-align: center;
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 2rem;
`
