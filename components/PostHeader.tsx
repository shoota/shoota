import React from 'react'

import PostType from '../types/post'

import { PostTitle } from './PostTitle'
import { DateTime, Picture } from 'gymnopedies'

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
    <>
      <PostTitle>{title}</PostTitle>
      <Picture
        transition
        image={{ src: url }}
        imageCaption={
          <>
            Photo by{' '}
            <a target='_blank' href={providerUrl} rel='noreferrer'>
              {provider}
            </a>
          </>
        }
      />
      <DateTime dateString={date} />
      {/* <Box sx={{ mb: 3 }}>
        <CoverImage title={title} coverImage={coverImage} />
      </Box> */}
    </>
  )
}

export default PostHeader
