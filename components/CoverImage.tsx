import React from 'react'
import Link from 'next/link'
import { Image, Box, Text, Link as RebassLink } from 'rebass'

import PostType from '../types/post'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  slug?: string
}

export const CoverImage: React.FC<Props> = ({ title, coverImage, slug }) => {
  return (
    <Box mx={0}>
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title} href={`/posts/${slug}`}>
            <Image src={coverImage.url} />
          </a>
        </Link>
      ) : (
        <Image src={coverImage.url} />
      )}
      <Text sx={{ fontSize: [1], textAlign: 'right' }}>
        Photo by{' '}
        <RebassLink href={coverImage.providerUrl}>
          {coverImage.provider}
        </RebassLink>
      </Text>
    </Box>
  )
}
