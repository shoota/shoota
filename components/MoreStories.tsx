import React from 'react'
import { Heading, Box } from 'rebass'

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
      <Box
        sx={{
          display: 'grid',
          gridGap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
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
    </section>
  )
}
