import React from 'react'
import Head from 'next/head'

import { SITE_NAME } from '@/lib/constants'
import { CAREER, SKILLS, SKILLS_INTRO, TALKS } from '@/lib/profile'
import { AppLayout } from '@/components/AppLayout'
import { ProfileHero } from '@/components/profile/ProfileHero'
import {
  CareerCard,
  ProfileListCard,
  ProfileSection,
} from '@/components/profile/ProfileSection'
import { TalkCard } from '@/components/profile/TalkCard'

const Profile: React.FC = () => {
  return (
    <AppLayout currentIndex={3} path='/profile' ogTitle='Profile'>
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
      <ProfileSection label='Talks'>
        <div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
          {TALKS.map((talk) => (
            <TalkCard key={talk.url} talk={talk} />
          ))}
        </div>
      </ProfileSection>
      <ProfileSection label='Career'>
        <CareerCard entries={CAREER} />
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
