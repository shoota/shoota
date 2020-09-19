import React from 'react'
import { Heading, Box } from 'rebass'

import { FlexIconContainer } from '../atoms/FlexIconContainer'
import { FlexIconBox, Props as FlexIconItemProps } from '../atoms/FlexIconItem'

type LegendProps = {
  name: string
  backgroundColor: string
}
type Props = {
  data: FlexIconItemProps[]
  legends?: LegendProps[]
}

export const SkillMap: React.FC<Props> = ({ data }) => {
  return (
    <Box pl="18%" pr="13%" sx={{ backgroundColor: 'background' }}>
      {/* <Text fontSize={[2, 2, 4]}>Skill set</Text> */}
      <Heading mb={2}>Skills</Heading>
      <FlexIconContainer>
        {data.map(({ backgroundColor, name, icon }) => (
          <FlexIconBox
            key={name}
            backgroundColor={backgroundColor}
            name={name}
            color="text"
            icon={icon}
          />
        ))}
      </FlexIconContainer>
    </Box>
  )
}
