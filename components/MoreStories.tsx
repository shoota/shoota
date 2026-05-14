import Post from '@/types/post'

import { PostPreview } from './PostPreview'

type Props = {
  posts: Post[]
}

export const MoreStories: React.FC<Props> = ({ posts }) => {
  return (
    <section>
      <ul className='m-0 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3'>
        {posts.map((post) => (
          <li key={post.slug} className='m-0 flex p-0'>
            <PostPreview
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
