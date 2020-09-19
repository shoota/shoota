import React from 'react'
import { Image, Text, Box } from 'rebass'

type Props = {
  name: string
  picture: string
}

const Avatar: React.FC<Props> = ({ name, picture }) => {
  return (
    <Box sx={{ textAlign: 'center', width: 'auto' }}>
      <Image
        src={picture}
        sx={{
          width: '20vh',
          borderRadius: 9999,
        }}
        alt={name}
      />
      <Text fontSize={5} p={2} fontWeight="bold">
        {name}
      </Text>
    </Box>
  )
}

export default Avatar
