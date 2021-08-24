import { Card } from '@arwes/core'
import styled from '@emotion/styled'

export const PostCard = styled(Card)`
  .arwes-card__picture {
    background-color: #05c6c1;
  }
  .arwes-card__image {
    // element style has "opacity 1" statically
    opacity: 0.8 !important;
    filter: grayscale(1);
  }
`
