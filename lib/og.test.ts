import { describe, expect, it } from 'vitest'

import { DEFAULT_OG_IMAGE_PATH, SITE_URL } from '@/lib/constants'
import { ogImageUrl } from '@/lib/og'

describe('ogImageUrl', () => {
  it('prefixes a site-relative path with the site origin', () => {
    expect(ogImageUrl('/assets/blog/keyboard.jpg')).toBe(
      `${SITE_URL}/assets/blog/keyboard.jpg`
    )
  })

  it('falls back to the site-wide avatar when the path is missing', () => {
    expect(ogImageUrl()).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`)
    expect(ogImageUrl(undefined)).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`)
    expect(ogImageUrl(null)).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`)
  })

  it('falls back to the site-wide avatar when the path is empty', () => {
    expect(ogImageUrl('')).toBe(`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`)
  })

  it('keeps the fallback on the site origin so crawlers can fetch it', () => {
    expect(ogImageUrl()).toMatch(new RegExp(`^${SITE_URL}/`))
  })
})
