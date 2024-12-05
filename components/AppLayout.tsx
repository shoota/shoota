import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import Meta from './meta'
import styled from '@emotion/styled'
import { HeaderNavigation } from 'gymnopedies'

type Props = {
  ogImage?: string
  ogTitle?: string
  path?: string
  currentIndex?: number
}

const Layout = styled.main`
  margin: 0 5vw;
  width: 90vw;
  max-width: 1820px;
`
const Content = styled.article`
  margin: 2rem auto;
`

export const AppLayout = ({
  ogImage,
  ogTitle,
  path,
  currentIndex,
  children,
}: PropsWithChildren<Props>) => {
  const router = useRouter()
  return (
    <>
      <Meta ogImage={ogImage} ogTitle={ogTitle} path={path} />
      <Layout>
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
        <Content>{children}</Content>
      </Layout>
    </>
  )
}
