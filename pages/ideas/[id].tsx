import Head from 'next/head'
import Link from 'next/link'

import { AppLayout } from '@/components/AppLayout'
import { GlobalStyles } from '@/components/blog/global-styles'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { SITE_NAME } from '@/lib/constants'
import { listIdeaPaths, loadIdeaPage } from '@/lib/ideas/detail'
import type { IdeaView } from '@/lib/ideas/view'

type Props = {
  idea: IdeaView
}

/**
 * One idea at `/ideas/[id]`. Unknown ids are `notFound` from `getStaticProps`,
 * and `fallback: 'blocking'` renders ids created after the last build on
 * first request, so a freshly posted idea has a page without a redeploy.
 */
const IdeaPage: React.FC<Props> = ({ idea }) => {
  const title = `Idea ${idea.createdAtLabel}`
  // `idea.id` was validated by `loadIdeaPage`; the path is built inline so
  // the store and Markdown modules behind `ideaPath` stay out of the bundle.
  return (
    <AppLayout currentIndex={2} path={`/ideas/${idea.id}`} ogTitle={title}>
      <Head>
        <title>{`${title} | ${SITE_NAME}`}</title>
      </Head>
      <h2 className='mb-8 text-center text-xs uppercase tracking-[0.3em] text-primary'>
        Idea
      </h2>
      <hr className='mx-auto mb-12 w-full max-w-3xl border-t border-muted-foreground/40' />
      <section className='mx-auto flex w-full max-w-3xl flex-col gap-8'>
        <GlobalStyles scope='.idea-body' />
        <IdeaCard idea={idea} />
        <p className='m-0 text-center text-sm'>
          <Link
            href='/ideas'
            className='text-muted-foreground underline underline-offset-4 hover:text-primary'
          >
            ← すべてのアイデア
          </Link>
        </p>
      </section>
    </AppLayout>
  )
}

export default IdeaPage

type Params = {
  params?: { id?: string | string[] }
}

export const getStaticProps = async ({ params }: Params) => {
  return loadIdeaPage(params?.id)
}

export const getStaticPaths = async () => {
  return {
    paths: await listIdeaPaths(),
    // Ids posted after the build are rendered on demand instead of 404ing.
    fallback: 'blocking' as const,
  }
}
