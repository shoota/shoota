import { Animator, AnimatorGeneralProvider } from '@arwes/animation'
import { Figure, Text } from '@arwes/core'

import React from 'react'

const Hero: React.FC = () => {
  return (
    <AnimatorGeneralProvider animator={{ duration: { enter: 600, exit: 200 } }}>
      <Animator animator={{ activate: true, manager: 'stagger' }}>
        <Figure src={'/assets/img/cover.jpg'}>
          人間は完全に整っているものと、どこかが欠けているものが同時に視界に入ったとき、欠けているも方に注目してしまう。
        </Figure>
        <Text as="h3">Skills, Works and Philosophy</Text>
        <Text as="p">{/* TODO */}</Text>
        <Text as="p">{/* TODO */}</Text>
      </Animator>
    </AnimatorGeneralProvider>
  )
}

export default Hero
