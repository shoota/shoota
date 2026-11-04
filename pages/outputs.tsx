import React from 'react'
import Head from 'next/head'

import { AppLayout } from '@/components/AppLayout'
import { OutputCard } from '@/components/outputs/OutputCard'
import { ProfileSection } from '@/components/profile/ProfileSection'
import { SITE_NAME } from '@/lib/constants'
import {
  buildOutputs,
  groupByYear,
  OutputEntry,
  outputKey,
} from '@/lib/outputs'
import { fetchTechBlogArticles, TECH_BLOG_NAME } from '@/lib/techBlog'

const DESCRIPTION = `@shoota の登壇・出演・取材と ${TECH_BLOG_NAME} の記事を時系列で並べたページ`

type Props = {
  entries: OutputEntry[]
}

const Outputs: React.FC<Props> = ({ entries }) => {
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
      {groupByYear(entries).map(({ year, entries: items }) => (
        <ProfileSection key={year} label={year}>
          <div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
            {items.map((entry) => (
              <OutputCard key={outputKey(entry)} entry={entry} />
            ))}
          </div>
        </ProfileSection>
      ))}
    </AppLayout>
  )
}

export default Outputs

export const getStaticProps = async () => {
  const articles = await fetchTechBlogArticles()
  return {
    props: { entries: buildOutputs(articles) },
    // 新しい記事を 1 時間以内に拾う。取れなかった回は登壇・出演だけで描く
    revalidate: 60 * 60,
  }
}
