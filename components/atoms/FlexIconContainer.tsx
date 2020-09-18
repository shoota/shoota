import React from 'react'
import { Flex } from 'rebass'

export const FlexIconContainer: React.FC = ({ children }) => {
  return (
    <Flex
      justifyContent="flex-start"
      flexWrap="wrap"
      alignItems="baseline"
      color="white"
    >
      {children}
    </Flex>
  )
}
