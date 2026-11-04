import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import { SITE_NAME } from '@/lib/constants'
import { CAREER, SKILLS, SKILLS_INTRO } from '@/lib/profile'
import { AppLayout } from '@/components/AppLayout'
import { ProfileHero } from '@/components/profile/ProfileHero'
import {
  CareerCard,
  ProfileListCard,
  ProfileSection,
} from '@/components/profile/ProfileSection'

const Profile: React.FC = () => {
  return (
    <AppLayout currentIndex={4} path='/profile' ogTitle='Profile'>
      <Head>
        <title>{`${SITE_NAME} | Profile`}</title>
      </Head>
      <section className='mx-auto mb-12 w-full'>
        <ProfileHero />
      </section>
      <ProfileSection label='Skills'>
        <ProfileListCard
          paragraphsLabel='おもな得意領域'
          paragraphs={SKILLS_INTRO}
          itemsLabel='おもな技術スタック'
          items={SKILLS}
        />
      </ProfileSection>
      <ProfileSection label='Career'>
        <CareerCard entries={CAREER} />
      </ProfileSection>
      <ProfileSection label='Outputs'>
        <p className='m-0 text-base leading-[1.85] text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          登壇・出演・記事は{' '}
          <Link href='/outputs' className='text-primary'>
            発信のページ
          </Link>{' '}
          に新しい順でまとめています。
        </p>
      </ProfileSection>
    </AppLayout>
  )
}

export default Profile

export const getStaticProps = async () => {
  return {
    props: {},
  }
}
