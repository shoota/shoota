/**
 * Site-relative path of the fallback Open Graph image. It must be served from
 * this origin: X's crawler honours robots.txt, and gist.github.com disallows
 * its raw file paths, so an image hosted there never shows up on a Twitter card.
 */
export const DEFAULT_OG_IMAGE_PATH = '/assets/og/avatar.jpg'

export const SITE_NAME = 'shoota works'

/** Canonical origin, used to make Open Graph URLs absolute. */
export const SITE_URL = 'https://shoota.work'

/** Site-wide fallback for `<meta name="description">` and Open Graph. */
export const SITE_DESCRIPTION = '@shootaのブログ'

/** X (Twitter) account credited on Twitter cards. */
export const X_ACCOUNT = '@shoota'

export const SOCIAL_URLS = {
  x: 'https://x.com/shoota',
  github: 'https://github.com/shoota',
  speakerDeck: 'https://speakerdeck.com/shoota',
} as const
