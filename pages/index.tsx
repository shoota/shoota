import React from 'react'
import Head from 'next/head'

import Container from '../components/container'
import Layout from '../components/layout'
import { SITE_NAME } from '../lib/constants'
import Hero from '../components/organisms/Hero'

const Index: React.FC = () => {
  return (
    <>
      <Layout>
        <Head>
          <title>{`${SITE_NAME} | Home`}</title>
        </Head>
        <Hero />
        <Container />
      </Layout>
    </>
  )
}

export default Index

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps = async () => {
  return {
    props: {},
  }
}
