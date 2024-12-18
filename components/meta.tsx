import Head from 'next/head'

import { HOME_OG_IMAGE_URL } from '../lib/constants'

const Meta: React.FC<{ ogImage?: string; ogTitle?: string; path?: string }> = ({
  ogTitle,
  ogImage,
  path,
}) => {
  const ogImageContent = ogImage
    ? `https://shoota.work${ogImage}`
    : HOME_OG_IMAGE_URL

  const ogTitleContent = ogTitle || 'shoota works'

  const ogUrl = path ? `https://shoota.work${path}` : 'https://shoota.work'

  return (
    <Head>
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/favicon/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon/favicon-16x16.png'
      />
      <link rel='manifest' href='/favicon/site.webmanifest' />
      <link
        rel='mask-icon'
        href='/favicon/safari-pinned-tab.svg'
        color='#000000'
      />
      <link rel='shortcut icon' href='/favicon/favicon.ico' />
      <meta name='msapplication-TileColor' content='#000000' />
      <meta name='msapplication-config' content='/favicon/browserconfig.xml' />
      <meta name='theme-color' content='#000' />
      <link rel='alternate' type='application/rss+xml' href='/feed.xml' />
      <meta name='description' content='@shootaのブログ' />
      {/* OGP */}
      <meta property='og:type' content='article' />
      <meta property='og:url' content={ogUrl} />
      <meta property='og:site_name' content='shoota works' />
      <meta property='og:title' content={ogTitleContent} />
      <meta property='og:image' content={ogImageContent} />
      <meta property='og:description' content='@shootaのブログ' />
      <meta name='twitter:title' content={ogTitleContent} />
      <meta name='twitter:text:title' content={ogTitleContent} />
      <meta name='twitter:image' content={ogImageContent} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:description' content='@shootaのブログ' />
    </Head>
  )
}

export default Meta
