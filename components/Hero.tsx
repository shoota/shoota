import React from 'react'
import { Box, Text } from 'rebass'
import { Flex, Box as FlexBox } from 'reflexbox'

const Hero: React.FC = () => {
  return (
    <Flex margin="24px" justifyContent="center" alignItems="center">
      <FlexBox>
        <Box
          sx={{
            backgroundImage: 'url(/assets/img/cover.jpg)',
            backgroundRepeat: 'no-repeat',
            minHeight: '530px',
            height: '30vh',
            width: '800px',
            color: 'white',
            textAlign: 'center',
            verticalAlign: 'middle',
            py: '20%',
          }}
        >
          <Box backgroundColor="transparent">
            <Text fontSize={6} p={2} fontWeight="bold">
              Shoota Kumano
            </Text>
            <Text fontSize={4} p={2} fontWeight="bold">
              Hi! Welcome to my Portfolio.
            </Text>
          </Box>
        </Box>
      </FlexBox>
    </Flex>
  )
}

export default Hero
