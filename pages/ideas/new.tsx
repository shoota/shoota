import Head from 'next/head'

import { AppLayout } from '@/components/AppLayout'
import { IdeaComposer } from '@/components/ideas/IdeaComposer'
import { SITE_NAME } from '@/lib/constants'

/**
 * Admin page for posting ideas from a phone. The path is public knowledge
 * (public repository); the boundary is the shared secret checked by the API.
 * Not linked from the navigation and marked noindex.
 */
const NewIdeaPage: React.FC = () => {
  return (
    <AppLayout path='/ideas/new' ogTitle='New idea'>
      <Head>
        <title>{`New idea | ${SITE_NAME}`}</title>
        <meta name='robots' content='noindex' />
      </Head>
      <h2 className='mb-8 text-center text-xs uppercase tracking-[0.3em] text-primary'>
        New idea
      </h2>
      <hr className='mx-auto mb-12 w-full max-w-3xl border-t border-muted-foreground/40' />
      <IdeaComposer />
    </AppLayout>
  )
}

export default NewIdeaPage
