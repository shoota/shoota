import React from 'react'
import Head from 'next/head'

import { SITE_NAME } from '@/lib/constants'
import { AppLayout } from '@/components/AppLayout'

type Props = {
  name: string
  picture: string
}

const Profile: React.FC<Props> = ({ name, picture }) => {
  return (
    <AppLayout currentIndex={2}>
      <Head>
        <title>{`${SITE_NAME} | Profile`}</title>
      </Head>
      <section className='mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 sm:px-6'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={picture}
          alt={name}
          className='h-40 w-40 rounded-full object-cover opacity-90 grayscale shadow-soft-glow transition duration-700 hover:opacity-100 hover:grayscale-0'
        />
        <h3 className='m-0 text-2xl'>{name}</h3>
        <p className='m-0 text-base leading-relaxed text-muted-foreground'>
          1984年、青森県うまれ。
          学生時代はカメラと遺伝生物学をこよなく愛していましたが、なぜかカメラメーカーのエンジニアとして社会にでました。
          東日本大震災をきっかけに地元での暮らしを願うようになり、青森へ転職＆移住、現在はフルリモートワーカーとして自宅でエンジニアをしています。
          ３人の息子と1人の嫁さんと暮らしている。もういちどいぬを飼いたい。
        </p>
      </section>
    </AppLayout>
  )
}

export default Profile

export const getStaticProps = async () => {
  return {
    props: {
      name: 'shoota kumano',
      picture: '/assets/img/avt.jpg',
    },
  }
}
