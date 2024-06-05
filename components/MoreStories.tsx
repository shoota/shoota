import Post from '../types/post'

import { PostPreview } from './PostPreview'
import styled from '@emotion/styled'

type Props = {
  posts: Post[]
}

export const MoreStories: React.FC<Props> = ({ posts }) => {
  return (
    <section>
      <Flex>
        <Grid>
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
        </Grid>
      </Flex>
    </section>
  )
}

const Flex = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  display: flex;
`

const Grid = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  display: grid;
  grid-gap: 32px 16px;
  grid-template-columns: 1fr;
  margin: auto;

  @media screen and (min-width: 40em) {
    grid-template-columns: 1fr;
  }

  @media screen and (min-width: 52em) {
    grid-template-columns: 1fr 1fr;
  }

  @media screen and (min-width: 64em) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
