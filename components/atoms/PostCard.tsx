import styled from '@emotion/styled'

export const PostCard = styled.div`
  .arwes-card__picture {
    background-color: #05c6c1;
  }
  .arwes-card__image {
    // element style has "opacity 1" statically
    opacity: 0.8 !important;
    filter: grayscale(1);
    transition: opacity 0.6s;
  }
  :hover {
    .arwes-card__image {
      opacity: 1 !important;
      filter: grayscale(0.4);
      transition:
        opacity 1.2s,
        filter 1s 0.4s;
    }
  }
`
