import React from 'react'
import Head from 'next/head'

import { AppLayout } from '../components/AppLayout'
import { SITE_NAME } from '../lib/constants'
import Hero from '../components/organisms/Hero'
import { Content } from 'gymnopedies'

const Index: React.FC = () => {
  return (
    <AppLayout>
      <Head>
        <title>{`${SITE_NAME} | Home`}</title>
      </Head>
      <Content>
        <Hero />
      </Content>
    </AppLayout>
  )
}

export default Index

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
