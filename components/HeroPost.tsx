import React from 'react'
import Link from 'next/link'
import { Box, Heading, Link as RebassLink } from 'rebass'

import DateFormatter from './date-formatter'
import { CoverImage } from './CoverImage'

type Props = {
  title: string
  coverImage: string
  date: string
  excerpt: string
  slug: string
}

export const HeroPost: React.FC<Props> = ({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) => {
  return (
    <section>
      <Box mb={[0, 1]}>
        <CoverImage title={title} src={coverImage} slug={slug} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridGap: 4,
          gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
        }}
      >
        <Box p={3}>
          <Heading>
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <RebassLink
                sx={{ color: 'text', fontSize: [2, 3, 5] }}
                href="/posts/[slug]"
              >
                {title}
              </RebassLink>
            </Link>
          </Heading>
          <DateFormatter dateString={date} />
        </Box>
        <Box p={3}>
          <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
        </Box>
      </Box>
    </section>
  )
}
