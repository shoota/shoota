import { describe, expect, it } from 'vitest'

import { ideaMarkdownToHtml } from '@/lib/ideas/markdown'

describe('ideaMarkdownToHtml', () => {
  it('renders GitHub-flavoured Markdown', async () => {
    const html = await ideaMarkdownToHtml('# Title\n\n- [x] done\n\n~~old~~')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<del>old</del>')
    expect(html).toContain('type="checkbox"')
  })

  it('turns single line breaks into <br>', async () => {
    const html = await ideaMarkdownToHtml('first\nsecond')
    expect(html).toContain('first<br>')
    expect(html).toContain('second')
  })

  it('removes <script> elements', async () => {
    const html = await ideaMarkdownToHtml(
      'before\n\n<script>alert(1)</script>\n\nafter'
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert(1)')
    expect(html).toContain('before')
    expect(html).toContain('after')
  })

  it('removes event handler attributes from raw HTML', async () => {
    const html = await ideaMarkdownToHtml('<img src="x" onerror="alert(1)">')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('alert(1)')
  })

  it('drops javascript: URLs from Markdown links', async () => {
    const html = await ideaMarkdownToHtml('[click](javascript:alert(1))')
    expect(html).toContain('<a>click</a>')
    expect(html).not.toContain('javascript:')
  })

  it('keeps https links', async () => {
    const html = await ideaMarkdownToHtml('[site](https://example.com)')
    expect(html).toContain('href="https://example.com"')
  })
})
