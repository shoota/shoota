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
      {heroPost && (
        <>
          <h2 className='mb-8 text-center text-xs uppercase tracking-[0.3em] text-primary'>
            最新の記事
          </h2>
          <hr className='mx-auto mb-12 w-full max-w-3xl border-t border-muted-foreground/40' />
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.coverImage}
            date={heroPost.date}
            slug={heroPost.slug}
            excerpt={heroPost.excerpt}
          />
        </>
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
