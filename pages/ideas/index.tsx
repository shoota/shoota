import Head from 'next/head'

import { AppLayout } from '@/components/AppLayout'
import { IdeaFeed, IdeaFeedItem } from '@/components/ideas/IdeaFeed'
import { SITE_NAME } from '@/lib/constants'
import { formatIdeaTimestamp } from '@/lib/ideas/format'
import { ideaMarkdownToHtml } from '@/lib/ideas/markdown'
import { loadLatest } from '@/lib/ideas/store'

type Props = {
  ideas: IdeaFeedItem[]
}

const IdeasPage: React.FC<Props> = ({ ideas }) => {
  return (
    <AppLayout currentIndex={2} path='/ideas' ogTitle='Ideas'>
      <Head>
        <title>{`Ideas | ${SITE_NAME}`}</title>
      </Head>
      <h2 className='mb-8 text-center text-xs uppercase tracking-[0.3em] text-primary'>
        Ideas
      </h2>
      <hr className='mx-auto mb-12 w-full max-w-3xl border-t border-muted-foreground/40' />
      <IdeaFeed ideas={ideas} />
    </AppLayout>
  )
}

export default IdeasPage

export const getStaticProps = async () => {
  const stored = await loadLatest()
  const sorted = [...stored].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  )
  const ideas: IdeaFeedItem[] = await Promise.all(
    sorted.map(async (idea) => ({
      id: idea.id,
      createdAt: idea.createdAt,
      createdAtLabel: formatIdeaTimestamp(idea.createdAt),
      html: await ideaMarkdownToHtml(idea.body),
    }))
  )

  return {
    props: { ideas },
    // The post API revalidates on demand; this is only a safety net.
    revalidate: 3600,
  }
}
