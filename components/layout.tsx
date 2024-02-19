import React from 'react'
import { Box } from 'rebass'

// import Footer from './footer'
import Meta from './meta'
import { NavBar } from './molecules/Navbar'

type Props = {
  ogImage?: string
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ ogImage, children }) => {
  return (
    <>
      <Meta ogImage={ogImage} />
      <div style={{ margin: '0 auto', width: '90vw', maxWidth: '1400px' }}>
        <NavBar />
        <Box my={4}>{children}</Box>
      </div>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
