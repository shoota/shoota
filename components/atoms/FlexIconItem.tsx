import React from 'react'
import { Text, Box } from 'rebass'
import { Box as FlexBox } from 'reflexbox'

type IconBoxProps = {
  name: string
  backgroundColor: string
}
export const FlexIconBox: React.FC<IconBoxProps> = ({
  name,
  backgroundColor,
  children,
}) => (
  <FlexBox px={1} py={1} textAlign="center" minWidth="88px" width="20%">
    <Box py={2} backgroundColor={backgroundColor}>
      {children}
      <Text fontSize={1}>{name}</Text>
    </Box>
  </FlexBox>
)
