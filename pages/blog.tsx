import Head from 'next/head'

import { MoreStories } from '@/components/MoreStories'
import { HeroPost } from '@/components/HeroPost'
import { AppLayout } from '@/components/AppLayout'
import { getAllPosts } from '@/lib/api'
import Post from '@/types/post'

type Props = {
  allPosts: Post[]
}

function Index({ allPosts }: Props) {
  const heroPost = allPosts[0]
  const morePosts = allPosts.slice(1)
  return (
    <AppLayout currentIndex={1}>
      <Head>
        <title>Blog</title>
      </Head>
      <header className='mb-10 text-center'>
        <p className='m-0 text-xs uppercase tracking-[0.3em] text-primary'>
          Articles
        </p>
        <h2 className='m-0 mt-3 text-3xl sm:text-4xl'>Blog</h2>
      </header>
      {heroPost && (
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
      )}
      {morePosts.length > 0 && <MoreStories posts={morePosts} />}
    </AppLayout>
  )
}

export default Index

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
  ])

  return {
    props: { allPosts },
  }
}
