import React from 'react'
import { AnimatorGeneralProvider } from '@arwes/animation'
import { Text } from '@arwes/core'
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

export const HeroPost: React.FC<Props> = ({
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
      {/* eslint-disable-next-line */}
      <div
        onClick={() => router.push(`/posts/${slug}`)}
        style={{ cursor: 'pointer' }}
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
          style={{ paddingBottom: '48px' }}
        >
          <Text as="div">{excerpt}</Text>
          <Text
            as="p"
            style={{
              position: 'absolute',
              top: '-1.2em',
              right: '4px',
              display: 'block',
              opacity: 1,
              fontSize: '12px',
            }}
          >
            Photo by{' '}
            <a href={coverImage.providerUrl} target="_blank" rel="noreferrer">
              {coverImage.provider}
            </a>
          </Text>
        </PostCard>
      </div>
    </AnimatorGeneralProvider>
  )
}
