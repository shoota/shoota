import React from 'react'
import { Box } from 'rebass'

// import Footer from './footer'
import Meta from './meta'
import { NavBar } from './molecules/Navbar'

type Props = {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Meta />
      <div style={{ margin: '0 240px' }}>
        <NavBar />
        <Box my={4}>{children}</Box>
      </div>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
