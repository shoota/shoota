import Head from 'next/head'

import { AppLayout } from '@/components/AppLayout'
import { IdeaFeed, IdeaFeedItem } from '@/components/ideas/IdeaFeed'
import { SITE_NAME } from '@/lib/constants'
import { sortNewestFirst } from '@/lib/ideas/sort'
import { loadLatest } from '@/lib/ideas/store'
import { IDEAS_REVALIDATE_SECONDS, toIdeaView } from '@/lib/ideas/view'

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
  const ideas = await Promise.all(
    sortNewestFirst(await loadLatest()).map(toIdeaView)
  )

  return {
    props: { ideas },
    // The post API revalidates on demand; this is only a safety net.
    revalidate: IDEAS_REVALIDATE_SECONDS,
  }
}
