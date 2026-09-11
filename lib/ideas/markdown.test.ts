import { describe, expect, it } from 'vitest'

import { ideaMarkdownToHtml } from '@/lib/ideas/markdown'

describe('ideaMarkdownToHtml', () => {
  it('renders GitHub-flavoured Markdown', async () => {
    const html = await ideaMarkdownToHtml('# Title\n\n- [x] done\n\n~~old~~')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<del>old</del>')
    expect(html).toContain('type="checkbox"')
  })

  it('returns an empty string for empty input', async () => {
    await expect(ideaMarkdownToHtml('')).resolves.toBe('')
  })

  it('turns single line breaks into <br>', async () => {
    const html = await ideaMarkdownToHtml('first\nsecond')
    expect(html).toContain('first<br>')
    expect(html).toContain('second')
  })

  // Raw HTML never reaches the output: remark-rehype drops it because
  // allowDangerousHtml is off, and rehype-sanitize would strip it otherwise.
  describe('raw HTML', () => {
    it('removes <script> elements', async () => {
      const html = await ideaMarkdownToHtml(
        'before\n\n<script>alert(1)</script>\n\nafter'
      )
      expect(html).not.toContain('<script')
      expect(html).not.toContain('alert(1)')
      expect(html).toContain('before')
      expect(html).toContain('after')
    })

    it('removes elements with event handler attributes', async () => {
      const html = await ideaMarkdownToHtml('<img src="x" onerror="alert(1)">')
      expect(html).not.toContain('onerror')
      expect(html).not.toContain('alert(1)')
    })
  })

  // These attributes are generated from Markdown syntax, so only
  // rehype-sanitize stands between the input and the output.
  describe('sanitizing generated attributes', () => {
    it('drops javascript: URLs from links', async () => {
      const html = await ideaMarkdownToHtml('[click](javascript:alert(1))')
      expect(html).toContain('<a>click</a>')
      expect(html).not.toContain('javascript:')
    })

    it('drops data: URLs from images', async () => {
      const html = await ideaMarkdownToHtml(
        '![x](data:text/html;base64,PHNjcmlwdD4=)'
      )
      expect(html).not.toContain('data:')
    })

    it('prefixes heading ids to avoid DOM clobbering', async () => {
      const html = await ideaMarkdownToHtml('<h2 id="location">x</h2>\n\n# T')
      expect(html).not.toContain('id="location"')
    })

    it('keeps https links', async () => {
      const html = await ideaMarkdownToHtml('[site](https://example.com)')
      expect(html).toContain('href="https://example.com"')
    })
  })
})
