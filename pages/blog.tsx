import React from 'react'
import Head from 'next/head'

import { ContainerBox } from '../components/ContainerBox'
import { MoreStories } from '../components/MoreStories'
import { HeroPost } from '../components/HeroPost'
import Layout from '../components/layout'
import { getAllPosts } from '../lib/api'
import { CMS_NAME } from '../lib/constants'
import Post from '../types/post'

type Props = {
  allPosts: Post[]
}

const Index = ({ allPosts }: Props) => {
  const heroPost = allPosts[0]
  const morePosts = allPosts.slice(1)
  return (
    <>
      <Layout>
        <Head>
          <title>Next.js Blog Example with {CMS_NAME}</title>
        </Head>
        <ContainerBox>
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
        </ContainerBox>
      </Layout>
    </>
  )
}

export default Index

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps = async () => {
  // TODO author prop is unnessesary
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ])

  return {
    props: { allPosts },
  }
}
