import React from 'react'
import { Box } from 'rebass'

import PostType from '../types/post'

import DateFormatter from './atoms/DateFormatter'
import { CoverImage } from './CoverImage'
import { PostTitle } from './PostTitle'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  date: string
}

const PostHeader: React.FC<Props> = ({ title, coverImage, date }) => {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <Box sx={{ mb: 3 }}>
        <CoverImage title={title} coverImage={coverImage} />
      </Box>
      <Box sx={{ mb: 2, fontSize: 2 }}>
        <DateFormatter dateString={date} />
      </Box>
    </>
  )
}

export default PostHeader
