import React from 'react'
import { Flex, Text, Box, Link } from 'rebass'

export function NavBar() {
  return (
    <Flex pl={2} pr={2} alignItems="baseline">
      <Text fontSize={[3, 5, 5]} p={2} fontWeight="bold">
        shoota works
      </Text>
      <Box ml="auto">
        <Link mx={1} fontSize={[0, 1, 2]} variant="nav" href="/">
          Home
        </Link>
        <Link mx={1} fontSize={[0, 1, 2]} variant="nav" href="/blog">
          Blog
        </Link>
        {/* <Link mx={1} fontSize={[0, 1, 2]} variant="nav" href="/works">
        WORKS
      </Link> */}
        <Link mx={1} fontSize={[0, 1, 2]} variant="nav" href="/profile">
          Profile
        </Link>
      </Box>
    </Flex>
  )
}
