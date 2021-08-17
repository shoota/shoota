import React from 'react'

import PostType from '../types/post'

import DateFormatter from './atoms/DateFormatter'
import { AnimatorGeneralProvider } from '@arwes/animation'
import { Button, Card, Text } from '@arwes/core'
import { useRouter } from 'next/router'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  date: string
  excerpt: string
  slug: string
}

export const PostPreview: React.FC<Props> = ({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) => {
  const router = useRouter()
  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: true }}
        image={{
          src: coverImage.url,
        }}
        title={
          <>
            {title}
            <Text as="p" style={{ display: 'block', fontSize: '12px' }}>
              <DateFormatter dateString={date} />
            </Text>
          </>
        }
        options={
          <Button
            palette="secondary"
            onClick={() => router.push(`/posts/${slug}`)}
          >
            <Text>この記事を見る</Text>
          </Button>
        }
        landscape
        hover
      >
        <Text as="div">{excerpt}</Text>
        <Text
          as="p"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'block',
            opacity: 1,
            fontSize: '12px',
          }}
        >
          Photo by <a href={coverImage.providerUrl}>{coverImage.provider}</a>
        </Text>
      </Card>
    </AnimatorGeneralProvider>
  )
}
