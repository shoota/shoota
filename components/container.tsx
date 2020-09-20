import React from 'react'
import { Box } from 'rebass'

export const Container: React.FC = ({ children }) => {
  return (
    <Box mx="auto" maxWidth={['1280px']} px={1} sx={{ width: '100%' }}>
      {children}
    </Box>
  )
}
