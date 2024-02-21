import React from 'react'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'

import { ContainerBox } from '../../components/ContainerBox'
import PostBody from '../../components/PostBody'
import PostHeader from '../../components/PostHeader'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import { PostTitle } from '../../components/PostTitle'
import markdownToHtml from '../../lib/markdownToHtml'
import PostType from '../../types/post'
import { SITE_NAME } from '../../lib/constants'

type Props = {
  post: PostType
}

const Post: React.FC<Props> = ({ post }) => {
  const router = useRouter()
  if (!router.isFallback && !post.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout ogImage={post.ogImage.url}>
      <ContainerBox>
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <article>
            <Head>
              <title>
                {post.title} | {SITE_NAME}
              </title>
            </Head>
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
            />
            <PostBody content={post.content} />
          </article>
        )}
      </ContainerBox>
    </Layout>
  )
}

export default Post

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])
  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          slug,
        },
      }
    }),
    fallback: false,
  }
}
