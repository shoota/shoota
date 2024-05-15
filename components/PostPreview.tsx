import React from 'react'
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
    // <PostCard
    //   image={{
    //     src: coverImage.url,
    //   }}
    //   title={
    //     <>
    //       {title}
    //       <p style={{ display: 'block', fontSize: '12px' }}>
    //         <DateFormatter dateString={date} />
    //       </p>
    //     </>
    //   }
    //   options={
    //     // eslint-disable-next-line
    //     <div onClick={() => router.push(`/posts/${slug}`)}>この記事を見る</div>
    //   }
    //   hover
    // >
    <>
      <div>{excerpt}</div>
      {coverImage.provider && (
        <p
          style={{
            position: 'absolute',
            top: '-18px',
            right: '0px',
            display: 'block',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '2px 4px',
            opacity: 1,
            fontSize: '12px',
          }}
        >
          Photo by{' '}
          <a target="_blank" href={coverImage.providerUrl} rel="noreferrer">
            {coverImage.provider}
          </a>
        </p>
      )}
    </>
    // </PostCard>
  )
}
