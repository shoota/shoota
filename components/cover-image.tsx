import React from 'react'
import Link from 'next/link'

type Props = {
  title: string
  src: string
  slug?: string
}

const CoverImage: React.FC<Props> = ({ title, src, slug }) => {
  const image = <img src={src} alt={`Cover for ${title}`} />
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title} href="/posts/[slug]">
            {image}
          </a>
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

export default CoverImage
