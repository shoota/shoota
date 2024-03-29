import React from 'react'
import Head from 'next/head'

import { HOME_OG_IMAGE_URL } from '../lib/constants'

const Meta: React.FC<{ ogImage?: string }> = ({ ogImage }) => {
  const ogImageContent = ogImage
    ? `https://shoota.work${ogImage}`
    : HOME_OG_IMAGE_URL

  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#000000"
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta name="description" content="@shootaのブログ" />
      {/* OGP */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://shoota.work" />
      <meta property="og:site_name" content="shoota works" />
      <meta property="og:title" content="shoota works" />
      <meta property="og:image" content={ogImageContent} />
      <meta name="twitter:title" content="shoota works" />
      <meta name="twitter:text:title" content="shoota works" />
      <meta name="twitter:image" content={ogImageContent} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content="@shootaのブログ" />
    </Head>
  )
}

export default Meta
