import React from 'react'
import Link from 'next/link'
import { Text, Box, Heading, Link as RebassLink } from 'rebass'

import PostType from '../types/post'

import DateFormatter from './atoms/DateFormatter'
import { CoverImage } from './CoverImage'

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
  return (
    <Box>
      <Box p={3}>
        <CoverImage slug={slug} title={title} coverImage={coverImage} />
      </Box>

      <Box p={3}>
        <Heading>
          <Link as={`/posts/${slug}`} href="/posts/[slug]">
            <RebassLink
              sx={{
                color: 'text',
                fontSize: [1, 2, 3],
                textDecorationLine: 'none',
              }}
              href="/posts/[slug]"
            >
              {title}
            </RebassLink>
          </Link>
        </Heading>
        <DateFormatter dateString={date} />
      </Box>

      <Box p={3}>
        <Text fontSize={[1, 2, 2]}>{excerpt}</Text>
      </Box>
    </Box>
  )
}
