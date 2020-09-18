import React from 'react'
import { Text, Box } from 'rebass'

type IconBoxProps = {
  name: string
  backgroundColor: string
  color?: string
}
export const FlexIconBox: React.FC<IconBoxProps> = ({
  name,
  backgroundColor,
  color,
  children,
}) => (
  <Box p={1} sx={{ textAlign: 'center', alignItems: 'center' }} width="150px">
    <Box py={2} color={color} backgroundColor={backgroundColor}>
      {children}
      <Text fontSize={[0, 0, 1]}>{name}</Text>
    </Box>
  </Box>
)
