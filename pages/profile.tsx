import React, { ComponentProps } from 'react'
import Head from 'next/head'

import { SITE_NAME } from '../lib/constants'
import Container from '../components/container'
import Layout from '../components/layout'
import Avatar from '../components/atoms/Avatar'
import { Skills } from '../components/organisms/Skills'

type Props = ComponentProps<typeof Avatar>

const Profile: React.FC<Props> = ({ name, picture }) => {
  return (
    <>
      <Layout>
        <Head>
          <title>{`${SITE_NAME} | Profile`}</title>
        </Head>
        <Avatar name={name} picture={picture} />
        <Skills />
        <Container />
      </Layout>
    </>
  )
}

export default Profile

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps = async () => {
  // TODO get static markdown via graymatter
  return {
    props: {
      name: 'shoota kumano',
      picture: '/assets/img/avt.jpg',
    },
  }
}
