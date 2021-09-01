import React from 'react'
import { Animator, AnimatorGeneralProvider } from '@arwes/animation'
import { Figure, Text } from '@arwes/core'
import styled from '@emotion/styled'

const StyledFigure = styled(Figure)`
  .arwes-figure__asset {
    background-color: #05c6c1;
  }
  .arwes-figure__image {
    opacity: 0.8;
  }
`

const Hero: React.FC = () => {
  return (
    <AnimatorGeneralProvider animator={{ duration: { enter: 600, exit: 200 } }}>
      <Animator animator={{ activate: true, manager: 'stagger' }}>
        <StyledFigure src="/assets/img/cover.jpg">
          人間は完全に整っているものと、どこかが欠けているものが同時に視界に入ったとき、欠けているも方に注目してしまう。
        </StyledFigure>
        <Text as="h3">Skills, Works and Philosophy</Text>
        <Text as="p">{/* TODO */}</Text>
        <Text as="p">{/* TODO */}</Text>
      </Animator>
    </AnimatorGeneralProvider>
  )
}

export default Hero
