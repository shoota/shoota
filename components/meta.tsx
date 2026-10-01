import Head from 'next/head'

import {
  HOME_OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  X_ACCOUNT,
} from '../lib/constants'

type Props = {
  /** Site-relative path of the Open Graph image; the avatar when omitted. */
  ogImage?: string
  ogTitle?: string
  /** `article` for a post or an idea, `website` for an index page. */
  ogType?: 'article' | 'website'
  /** Page description; the site-wide one when omitted. */
  description?: string
  path?: string
}

const Meta: React.FC<Props> = ({
  ogTitle,
  ogImage,
  ogType = 'article',
  description = SITE_DESCRIPTION,
  path,
}) => {
  const ogImageContent = ogImage ? `${SITE_URL}${ogImage}` : HOME_OG_IMAGE_URL

  const ogTitleContent = ogTitle || SITE_NAME

  const ogUrl = path ? `${SITE_URL}${path}` : SITE_URL

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
      <meta name='description' content={description} />
      {/* OGP */}
      <meta property='og:type' content={ogType} />
      <meta property='og:url' content={ogUrl} />
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:title' content={ogTitleContent} />
      <meta property='og:image' content={ogImageContent} />
      <meta property='og:description' content={description} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content={X_ACCOUNT} />
      <meta name='twitter:title' content={ogTitleContent} />
      <meta name='twitter:text:title' content={ogTitleContent} />
      <meta name='twitter:image' content={ogImageContent} />
      <meta name='twitter:description' content={description} />
    </Head>
  )
}

export default Meta
