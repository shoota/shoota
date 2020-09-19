import React, { ReactNode } from 'react'
import { Text, Box } from 'rebass'

export type Props = {
  name: string
  backgroundColor: string
  color?: string
  icon?: ReactNode
}
export const FlexIconBox: React.FC<Props> = ({
  name,
  backgroundColor,
  color,
  icon,
}) => (
  <Box
    ml={2}
    mb={2}
    backgroundColor={backgroundColor}
    sx={{ borderRadius: '2px', textAlign: 'center' }}
    width="180px"
  >
    <Box py={2} color={color}>
      {icon}
      <Text fontSize={[0, 0, 1]}>{name}</Text>
    </Box>
  </Box>
)
