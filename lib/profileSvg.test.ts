import { describe, expect, it } from 'vitest'

import { CAREER, MEDIA, PROFILE, SKILLS, TALKS } from '@/lib/profile'
import {
  buildSections,
  cycleSeconds,
  escapeXml,
  FADE_SECONDS,
  renderProfileSvg,
  SEGMENT_SECONDS,
  textWidth,
  truncate,
  wrapLines,
} from '@/lib/profileSvg'

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe(
      'a &amp; b &lt; c &gt; d &quot; e &apos; f'
    )
  })
})

describe('textWidth', () => {
  it('counts a full-width character as wider than an ASCII one', () => {
    expect(textWidth('あ', 10)).toBeGreaterThan(textWidth('a', 10))
    expect(textWidth('あ', 10)).toBe(10)
  })
})

describe('wrapLines', () => {
  it('breaks Japanese text between any characters', () => {
    expect(wrapLines('あいうえお', 30, 10)).toEqual(['あいう', 'えお'])
  })

  it('keeps ASCII words whole and drops the space at a line break', () => {
    expect(wrapLines('React TypeScript', 40, 10)).toEqual([
      'React',
      'TypeScript',
    ])
  })

  it('returns a single line when the text fits', () => {
    expect(wrapLines('短い', 100, 10)).toEqual(['短い'])
  })
})

describe('truncate', () => {
  it('leaves text that fits untouched', () => {
    expect(truncate('abc', 100, 10)).toBe('abc')
  })

  it('ends with an ellipsis and stays within the width', () => {
    const result = truncate('あいうえおかきくけこ', 50, 10)
    expect(result.endsWith('…')).toBe(true)
    expect(textWidth(result, 10)).toBeLessThanOrEqual(50)
  })
})

describe('buildSections', () => {
  it('shows the profile in the page order, with About and Stack added', () => {
    expect(buildSections().map((section) => section.label)).toEqual([
      'About',
      'Skills',
      'Stack',
      'Talks',
      'Career',
      'Media',
    ])
  })

  it('covers every talk, career entry, skill and media entry', () => {
    const bodies = buildSections().map((section) => section.body)
    const [, , stack, talks, career, media] = bodies
    for (const skill of SKILLS) expect(stack).toContain(escapeXml(skill))
    for (const talk of TALKS) expect(talks).toContain(talk.date)
    for (const entry of CAREER)
      expect(career).toContain(escapeXml(entry.period))
    for (const entry of MEDIA) expect(media).toContain(entry.date)
  })
})

describe('renderProfileSvg', () => {
  const svg = renderProfileSvg()

  it('is a standalone SVG document with the profile name', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true)
    expect(svg).toContain(PROFILE.name)
    expect(svg).toContain(`@${PROFILE.handle}`)
  })

  it('leaves no bare ampersand outside the CDATA style block', () => {
    const withoutStyle = svg.replace(/<style>[\s\S]*?<\/style>/, '')
    expect(withoutStyle).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/)
  })

  it('runs one animation cycle of sections × segment seconds', () => {
    const cycle = cycleSeconds(buildSections().length)
    expect(cycle).toBe(6 * SEGMENT_SECONDS)
    expect(svg).toContain(`animation: fade ${cycle}s linear infinite`)
    expect(FADE_SECONDS * 2).toBeLessThan(SEGMENT_SECONDS)
  })

  it('delays each section by one segment more than the previous', () => {
    for (let index = 0; index < 6; index += 1) {
      expect(svg).toContain(
        `.s${index} { animation-delay: ${index * SEGMENT_SECONDS}s; }`
      )
      expect(svg).toContain(`class="section s${index}"`)
    }
  })

  it('falls back to initials without an avatar and embeds one when given', () => {
    expect(svg).toContain('>SK</text>')
    expect(svg).not.toContain('<image')
    const withAvatar = renderProfileSvg({
      avatarDataUri: 'data:image/jpeg;base64,AAAA',
    })
    expect(withAvatar).toContain('href="data:image/jpeg;base64,AAAA"')
    expect(withAvatar).not.toContain('>SK</text>')
  })

  it('stays well under the Camo proxy size limit', () => {
    expect(Buffer.byteLength(svg, 'utf8')).toBeLessThan(200 * 1024)
  })
})
