import React from 'react'
import { Flex } from 'reflexbox'

export const FlexIconContainer: React.FC = ({ children }) => {
  return (
    <Flex
      justifyContent="flex-start"
      flexWrap="wrap"
      alignItems="center"
      color="white"
    >
      {children}
    </Flex>
  )
}
