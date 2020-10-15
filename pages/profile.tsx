import React, { ComponentProps } from 'react'
import Head from 'next/head'

import { SITE_NAME } from '../lib/constants'
import { ContainerBox } from '../components/ContainerBox'
import Layout from '../components/layout'
import Avatar from '../components/atoms/Avatar'
import { SkillMap } from '../components/organisms/SkillMap'
import { skills } from '../data/skills'

type Props = ComponentProps<typeof Avatar>

const Profile: React.FC<Props> = ({ name, picture }) => {
  return (
    <>
      <Layout>
        <Head>
          <title>{`${SITE_NAME} | Profile`}</title>
        </Head>
        <Avatar name={name} picture={picture} />
        <SkillMap data={skills} />
        <ContainerBox />
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
