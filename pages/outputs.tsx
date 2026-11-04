import React from 'react'
import Head from 'next/head'

import { AppLayout } from '@/components/AppLayout'
import { MediaCard } from '@/components/outputs/MediaCard'
import { TalkCard } from '@/components/outputs/TalkCard'
import { TechBlogCard } from '@/components/outputs/TechBlogCard'
import { ProfileSection } from '@/components/profile/ProfileSection'
import { SITE_NAME } from '@/lib/constants'
import { MEDIA, TALKS } from '@/lib/outputs'
import {
  fetchTechBlogArticles,
  TECH_BLOG_NAME,
  TechBlogArticle,
} from '@/lib/techBlog'

const DESCRIPTION = `@shoota の登壇資料、${TECH_BLOG_NAME} の記事、出演した Podcast や取材`

const gridClassName =
  'grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'

type Props = {
  articles: TechBlogArticle[]
}

const Outputs: React.FC<Props> = ({ articles }) => {
  return (
    <AppLayout
      currentIndex={3}
      path='/outputs'
      ogTitle='Outputs'
      description={DESCRIPTION}
    >
      <Head>
        <title>{`${SITE_NAME} | Outputs`}</title>
      </Head>
      <ProfileSection label='Talks'>
        <div className={gridClassName}>
          {TALKS.map((talk) => (
            <TalkCard key={talk.url} talk={talk} />
          ))}
        </div>
      </ProfileSection>
      {articles.length > 0 && (
        <ProfileSection label='Web Articles'>
          <div className={gridClassName}>
            {articles.map((article) => (
              <TechBlogCard key={article.url} article={article} />
            ))}
          </div>
        </ProfileSection>
      )}
      <ProfileSection label='Media'>
        <div className={gridClassName}>
          {MEDIA.map((entry) => (
            <MediaCard key={entry.url} entry={entry} />
          ))}
        </div>
      </ProfileSection>
    </AppLayout>
  )
}

export default Outputs

export const getStaticProps = async () => {
  const articles = await fetchTechBlogArticles()
  return {
    props: { articles },
    // 新しい記事を 1 時間以内に拾う。取れなかった回は Web Articles を出さずに描く
    revalidate: 60 * 60,
  }
}
