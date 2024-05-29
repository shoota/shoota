import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import Meta from './meta'
import styled from '@emotion/styled'
import { HeaderNavigation } from 'gymnopedies'

type Props = {
  ogImage?: string
  ogTitle?: string
  currentIndex?: number
}

const Box = styled.div`
  margin: 32px 0;
`

export const AppLayout = ({
  ogImage,
  ogTitle,
  currentIndex,
  children,
}: PropsWithChildren<Props>) => {
  const router = useRouter()
  return (
    <>
      <Meta ogImage={ogImage} ogTitle={ogTitle} />
      <HeaderNavigation
        title='shoota works'
        menuItems={[
          {
            name: 'Home',
            onClick: () => router.push('/'),
          },
          { name: 'Blog', onClick: () => router.push('/blog') },
          { name: 'Profile', onClick: () => router.push('/profile') },
        ]}
        currentIndex={currentIndex}
      />
      <Box>{children}</Box>
    </>
  )
}
