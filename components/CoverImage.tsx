import React from 'react'
import Link from 'next/link'
import { Image, Box } from 'rebass'

type Props = {
  title: string
  src: string
  slug?: string
}

export const CoverImage: React.FC<Props> = ({ title, src, slug }) => {
  return (
    <Box mx={0}>
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title} href={`/posts/${slug}`}>
            <Image src={src} />
          </a>
        </Link>
      ) : (
        <Image src={src} />
      )}
    </Box>
  )
}
