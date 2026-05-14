import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

import Meta from './meta'
import { HeaderNavigation } from '@/components/blog/header-navigation'

type Props = {
  ogImage?: string
  ogTitle?: string
  path?: string
  currentIndex?: number
}

export const AppLayout = ({
  ogImage,
  ogTitle,
  path,
  currentIndex,
  children,
}: PropsWithChildren<Props>) => {
  const router = useRouter()
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Meta ogImage={ogImage} ogTitle={ogTitle} path={path} />
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <HeaderNavigation
          title='shoota works'
          currentIndex={currentIndex}
          menuItems={[
            { name: 'Home', onClick: () => router.push('/') },
            { name: 'Blog', onClick: () => router.push('/blog') },
            { name: 'Profile', onClick: () => router.push('/profile') },
          ]}
        />
        <main className='mx-auto my-8'>{children}</main>
        <footer className='mt-24 border-t border-border pt-6 pb-12 text-center text-sm text-muted-foreground'>
          &copy; Shoota Kumano all reserved
        </footer>
      </div>
    </div>
  )
}
