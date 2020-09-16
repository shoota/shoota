import React from 'react'
import Head from 'next/head'

import Container from '../components/container'
import Layout from '../components/layout'
import { CMS_NAME } from '../lib/constants'
import Hero from '../components/Hero'

const Index = () => {
  return (
    <>
      <Layout>
        <Head>
          <title>Next.js Blog Example with {CMS_NAME}</title>
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
