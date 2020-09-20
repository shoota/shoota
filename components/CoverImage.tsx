import React from 'react'
import Link from 'next/link'
import { Image, Box } from 'rebass'

type Props = {
  title: string
  src: string
  slug?: string
}

export const CoverImage: React.FC<Props> = ({ title, src, slug }) => {
  const image = <Image src={src} />

  return (
    <Box mx={0}>
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title} href={`/posts/${slug}`}>
            {image}
          </a>
        </Link>
      ) : (
        image
      )}
    </Box>
  )
}
