import React from 'react'
import { Flex, Text, Box, Link } from 'rebass'

export const NavBar = () => (
  <Flex pl={2} pr={6} alignItems="baseline">
    <Text fontSize={4} p={2} fontWeight="bold">
      shoota.work
    </Text>
    <Box mx="auto" />
    <Link px={3} variant="nav" href="/">
      Home
    </Link>
    <Link px={3} variant="nav" href="/blog">
      Blog
    </Link>
    <Link px={3} variant="nav" href="#!">
      WORKS
    </Link>
    <Link px={3} variant="nav" href="#!">
      Profile
    </Link>
  </Flex>
)
