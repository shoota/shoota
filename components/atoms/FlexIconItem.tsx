import React from 'react'
import { Text, Box } from 'rebass'

type IconBoxProps = {
  name: string
  backgroundColor: string
}
export const FlexIconBox: React.FC<IconBoxProps> = ({
  name,
  backgroundColor,
  children,
}) => (
  <Box
    p={1}
    sx={{ textAlign: 'center', alignItems: 'center' }}
    minWidth="88px"
    width="20%"
  >
    <Box py={2} backgroundColor={backgroundColor}>
      {children}
      <Text fontSize={[0, 0, 1]}>{name}</Text>
    </Box>
  </Box>
)
