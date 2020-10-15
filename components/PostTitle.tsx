import React from 'react'
import { Heading } from 'rebass'

export const PostTitle: React.FC = ({ children }) => {
  return (
    <Heading sx={{ mb: [1, 2, 4] }} fontSize={[3, 4, 5]}>
      {children}
    </Heading>
  )
}
