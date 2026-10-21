import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from './constants'

/**
 * Absolute URL of a page's Open Graph image. `path` is site-relative (for
 * example a post's `ogImage.url`); when it is missing or empty the site-wide
 * avatar is used, so every page has an image that crawlers can fetch.
 */
export const ogImageUrl = (path?: string | null): string =>
  `${SITE_URL}${path || DEFAULT_OG_IMAGE_PATH}`
