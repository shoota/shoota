import React from 'react'
import { Box } from 'rebass'
// import { Box as FlexBox } from 'reflexbox'

import { FlexIconContainer } from '../atoms/FlexIconContainer'
import { FlexIconBox, Props as FlexIconItemProps } from '../atoms/FlexIconItem'

type Props = {
  data: FlexIconItemProps[]
}

export const SkillMap: React.FC<Props> = ({ data }) => {
  return (
    <Box
      pl="18%"
      pr="13%"
      sx={{ backgroundColor: 'background', textAlign: 'center' }}
    >
      {/* <Text fontSize={[2, 2, 4]}>Skill set</Text> */}
      <FlexIconContainer>
        {data.map(({ backgroundColor, name, icon }) => (
          <FlexIconBox
            key={name}
            backgroundColor={backgroundColor}
            name={name}
            color="black"
            icon={icon}
          />
        ))}
      </FlexIconContainer>
    </Box>
  )
}
