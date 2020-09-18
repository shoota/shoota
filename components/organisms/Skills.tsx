import React from 'react'
import {
  Typescript,
  ReactJs,
  Redux,
  Javascript,
  NextDotJs,
  Graphql,
  Apollographql,
  Eslint,
  NodeDotJs,
  Webpack,
} from '@icons-pack/react-simple-icons'
import { Box } from 'rebass'
// import { Box as FlexBox } from 'reflexbox'

import { FlexIconContainer } from '../atoms/FlexIconContainer'
import { FlexIconBox } from '../atoms/FlexIconItem'

const size = 24

export const Skills: React.FC = () => {
  return (
    <Box mx="10%" sx={{ backgroundColor: 'background', width: '80%' }}>
      {/* <Text fontSize={[2, 2, 4]}>Skill set</Text> */}
      <FlexIconContainer>
        <FlexIconBox backgroundColor="#339933" name="Node.js">
          <NodeDotJs size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#000000" name="Next.js">
          <NextDotJs size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#007ACC" name="TypeScript">
          <Typescript size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#F7DF1E" name="JavaScript">
          <Javascript size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#61DAFB" name="React">
          <ReactJs size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#764ABC" name="Redux">
          <Redux size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#311C87" name="Apollo GraphQL">
          <Apollographql size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#E10098" name="GraphQL">
          <Graphql size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#4B32C3" name="ESLint">
          <Eslint size={size} />
        </FlexIconBox>
        <FlexIconBox backgroundColor="#8DD6F9" name="Webpack">
          <Webpack size={size} />
        </FlexIconBox>
      </FlexIconContainer>
    </Box>
  )
}
