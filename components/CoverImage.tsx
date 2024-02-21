import styled from '@emotion/styled'
import React from 'react'
import Link from 'next/link'
import { Image, Box, Text, Link as RebassLink } from 'rebass'

import PostType from '../types/post'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  slug?: string
}

const ArwesImage = styled(Image)`
  opacity: 0.8;
  filter: grayscale(1);
`

export const CoverImage: React.FC<Props> = ({ title, coverImage, slug }) => {
  return (
    <Box mx={0} style={{ textAlign: 'center' }}>
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title} href={`/posts/${slug}`}>
            <ArwesImage src={coverImage.url} />
          </a>
        </Link>
      ) : (
        <ArwesImage
          src={coverImage.url}
          style={{ marginRight: 'auto', maxHeight: '40vh' }}
        />
      )}
      <Text sx={{ fontSize: [1] }}  style={{ textAlign: 'right' }}>
        Photo by{' '}
        <RebassLink href={coverImage.providerUrl}>
          {coverImage.provider}
        </RebassLink>
      </Text>
    </Box>
  )
}
