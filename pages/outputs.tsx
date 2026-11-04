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
      <section className='mx-auto mb-12 w-full'>
        <p className='m-0 text-xs uppercase tracking-[0.3em] text-primary'>
          Outputs
        </p>
        <h1 className='m-0 mt-2 text-4xl font-bold leading-tight text-accent [text-shadow:var(--text-shadow-glow)]'>
          発信
        </h1>
        <p className='m-0 mt-4 max-w-2xl text-base leading-[1.85] text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          登壇した資料、出演した Podcast や取材、{TECH_BLOG_NAME}{' '}
          に書いた記事を新しい順に並べています。
        </p>
      </section>
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
