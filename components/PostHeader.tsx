import React from 'react'
import { Box } from 'rebass'

import Author from '../types/author'

import DateFormatter from './atoms/DateFormatter'
import { CoverImage } from './CoverImage'
import { PostTitle } from './PostTitle'

type Props = {
  title: string
  coverImage: string
  date: string
  author: Author
}

const PostHeader: React.FC<Props> = ({ title, coverImage, date }) => {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <Box sx={{ mb: 3 }}>
        <CoverImage title={title} src={coverImage} />
      </Box>
      <Box sx={{ mb: 2, fontSize: 2 }}>
        <DateFormatter dateString={date} />
      </Box>
    </>
  )
}

export default PostHeader
