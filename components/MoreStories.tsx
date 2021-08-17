import React from 'react'
import { Heading, Box, Flex } from 'rebass'

import Post from '../types/post'

import { PostPreview } from './PostPreview'

type Props = {
  posts: Post[]
}

export const MoreStories: React.FC<Props> = ({ posts }) => {
  return (
    <section>
      <Heading mb={2} fontSize={[2, 2, 4]}>
        More Articles
      </Heading>
      <Flex>
        <Box
          sx={{
            display: 'grid',
            gridGap: 12,
            gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
            margin: 'auto ',
          }}
        >
          {posts.map((post) => (
            <PostPreview
              key={post.slug}
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          ))}
        </Box>
      </Flex>
    </section>
  )
}
