import React from 'react'
import Link from 'next/link'
import { Text, Box, Heading, Link as RebassLink } from 'rebass'
import styled from 'styled-components'

import DateFormatter from './atoms/DateFormatter'
import { CoverImage } from './CoverImage'

type Props = {
  title: string
  coverImage: string
  date: string
  excerpt: string
  slug: string
}

const StyledSection = styled.section`
  margin-bottom: 24px;
`

export const HeroPost: React.FC<Props> = ({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) => {
  return (
    <StyledSection>
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
                sx={{
                  color: 'text',
                  fontSize: [2, 3, 5],
                  textDecorationLine: 'none',
                }}
                href="/posts/[slug]"
              >
                {title}
              </RebassLink>
            </Link>
          </Heading>
          <DateFormatter dateString={date} />
        </Box>
        <Box p={3}>
          <Text fontSize={[1, 2, 2]}>{excerpt}</Text>
        </Box>
      </Box>
    </StyledSection>
  )
}
