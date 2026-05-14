import Head from 'next/head'

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
          <p className='mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg'>
            shoota の個人サイトです。日々考えたこと・撮ったもの・書いたものを置いています。
          </p>
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
