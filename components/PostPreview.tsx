import React from 'react'
import { AnimatorGeneralProvider } from '@arwes/animation'
import { Button, Text } from '@arwes/core'
import { useRouter } from 'next/router'

import PostType from '../types/post'

import DateFormatter from './atoms/DateFormatter'
import { PostCard } from './atoms/PostCard'

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
      <PostCard
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
        {coverImage.provider && (
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
        )}
      </PostCard>
    </AnimatorGeneralProvider>
  )
}
