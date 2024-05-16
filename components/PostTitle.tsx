import styled from '@emotion/styled'
import React, { PropsWithChildren } from 'react'

export const PostTitle = ({ children }: PropsWithChildren) => {
  return <Heading>{children}</Heading>
}

const Heading = styled.h1`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  font-size: 24px;
  margin-bottom: 4px;
  font-size: 20px;

  @media screen and (min-width: 40em) {
    margin-bottom: 8px;
    font-size: 24px;
  }

  @media screen and (min-width: 52em) {
    margin-bottom: 32px;
    font-size: 32px;
  }
`
