import React from 'react'
import { Flex, Text, Box, Link } from 'rebass'

export const NavBar = () => (
  <Flex pl={2} pr={6} alignItems="baseline" backgroundColor="background">
    <Text fontSize={[2, 4, 6]} p={2} fontWeight="bold">
      shoota.work
    </Text>
    <Box mx="auto" />
    <Link mx={1} fontSize={[0, 1, 2]} variant="nav" href="/">
      Home
    </Link>
    <Link px={3} fontSize={[0, 1, 2]} variant="nav" href="/blog">
      Blog
    </Link>
    <Link px={3} fontSize={[0, 1, 2]} variant="nav" href="#!">
      WORKS
    </Link>
    <Link px={3} fontSize={[0, 1, 2]} variant="nav" href="/profile">
      Profile
    </Link>
  </Flex>
)
