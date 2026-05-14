import Head from 'next/head'
import Link from 'next/link'

import { AppLayout } from '@/components/AppLayout'
import Hero from '@/components/organisms/Hero'
import { SITE_NAME } from '@/lib/constants'

const Index: React.FC = () => {
  return (
    <AppLayout currentIndex={0}>
      <Head>
        <title>{`${SITE_NAME} | Home`}</title>
      </Head>
      <section className='mx-auto w-full'>
        <Hero />
        <div className='mx-auto mt-16 max-w-2xl text-center'>
          <p className='m-0 text-xs uppercase tracking-[0.3em] text-primary'>
            Welcome
          </p>
          <div className='mt-6 flex flex-wrap justify-center gap-3'>
            <Link
              href='/blog'
              className='inline-block rounded-full border border-border px-5 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary'
            >
              Blog →
            </Link>
            <Link
              href='/profile'
              className='inline-block rounded-full border border-border px-5 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary'
            >
              About →
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}

export default Index

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
