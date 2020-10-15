import React from 'react'
import { Box, Text, Flex } from 'rebass'

const Hero: React.FC = () => {
  return (
    <Flex margin="24px" justifyContent="center" alignItems="center">
      <Box
        sx={{
          backgroundImage: 'url(/assets/img/cover.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          width: '100%',
          color: 'white',
          textAlign: 'center',
          py: '20%',
        }}
      >
        <Box backgroundColor="transparent">
          <Text fontSize={6} p={2} fontWeight="bold">
            Shoota Kumano
          </Text>
          <Text fontSize={4} p={2} fontWeight="bold">
            Skills, Works and Philosophy
          </Text>
        </Box>
      </Box>
    </Flex>
  )
}

export default Hero
