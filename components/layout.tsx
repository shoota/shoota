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
      <Box mx="5vw" sx={{ backgroundColor: 'background', width: '90vw' }}>
        <NavBar />
        <Box my={4}>{children}</Box>
      </Box>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
