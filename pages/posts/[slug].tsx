import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'

import PostBody from '@/components/PostBody'
import PostHeader from '@/components/PostHeader'
import PostNavigation, { NavPost } from '@/components/PostNavigation'
import { AppLayout } from '@/components/AppLayout'
import { getPostBySlug, getAllPosts } from '@/lib/api'
import markdownToHtml from '@/lib/markdownToHtml'
import PostType from '@/types/post'
import { SITE_NAME } from '@/lib/constants'

type Props = {
  post: PostType
  prev: NavPost | null
  next: NavPost | null
}

const Post: React.FC<Props> = ({ post, prev, next }) => {
  const router = useRouter()
  if (!router.isFallback && !post.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <AppLayout
      ogImage={post.ogImage.url}
      ogTitle={post.title}
      path={`/posts/${post.slug}`}
      currentIndex={1}
    >
      {router.isFallback ? (
        <h1 className='m-0 text-center text-2xl'>Loading…</h1>
      ) : (
        <>
          <Head>
            <title>{`${post.title} | ${SITE_NAME}`}</title>
          </Head>
          <article className='mx-auto w-full'>
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
            />
            <PostBody content={post.content} />
            <PostNavigation prev={prev} next={next} />
          </article>
        </>
      )}
    </AppLayout>
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

  const allPosts = getAllPosts(['title', 'slug'])
  const idx = allPosts.findIndex((p) => p.slug === params.slug)
  const prevPost = idx > 0 ? allPosts[idx - 1] : null
  const nextPost =
    idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null

  return {
    props: {
      post: {
        ...post,
        content,
      },
      prev: prevPost
        ? { slug: prevPost.slug, title: prevPost.title }
        : null,
      next: nextPost
        ? { slug: nextPost.slug, title: nextPost.title }
        : null,
    },
  }
}

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
