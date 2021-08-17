import React from 'react'
import Head from 'next/head'

import { SITE_NAME } from '../lib/constants'
import Layout from '../components/layout'
import { Figure, Text } from '@arwes/core'

type Props = {
  name: string
  picture: string
}

const Profile: React.FC<Props> = ({ name, picture }) => {
  return (
    <>
      <Layout>
        <Head>
          <title>{`${SITE_NAME} | Profile`}</title>
        </Head>
        <Figure style={{ width: '20vh' }} src={picture} />
        <Text as="h3">{name}</Text>
        <Text as="p">
          1984年、青森県うまれ。
          学生時代はカメラと遺伝生物学をこよなく愛していましたが、なぜかカメラメーカーのエンジニアとして社会にでました。
          東日本大震災をきっかけに地元での暮らしを願うようになり、青森へ転職＆移住、現在はフルリモートワーカーとして自宅でエンジニアをしています。
          ３人の息子と1人の嫁さんと暮らしている。もういちどいぬを飼いたい。
        </Text>
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
