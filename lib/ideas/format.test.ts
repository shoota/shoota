import { describe, expect, it } from 'vitest'

import {
  EMPTY_EXCERPT,
  MAX_DESCRIPTION_LENGTH,
  formatIdeaTimestamp,
  ideaDescription,
  ideaExcerpt,
  ideaPageTitle,
} from '@/lib/ideas/format'

describe('ideaExcerpt', () => {
  it.each([
    ['a heading', '# Title\n\nbody', 'Title'],
    ['a deeper heading', '### Title', 'Title'],
    ['a plain first line', 'first\nsecond', 'first'],
    ['leading blank lines', '\n\n  \n  text  \n', 'text'],
    ['a heading marker without text, then a line', '#\nnext', 'next'],
    ['a hash inside the line', 'issue #12', 'issue #12'],
  ])('takes the first non-empty line from %s', (_, body, expected) => {
    expect(ideaExcerpt(body)).toBe(expected)
  })

  it.each([
    ['an empty body', ''],
    ['only whitespace', ' \n\t\n'],
    ['only heading markers', '#\n##'],
    ['no body', null],
  ])('falls back for %s', (_, body) => {
    expect(ideaExcerpt(body)).toBe(EMPTY_EXCERPT)
  })
})

describe('ideaDescription', () => {
  it.each([
    ['a plain line', 'first line\nsecond', 'first line'],
    ['a heading', '## Title\n\nbody', 'Title'],
    ['a quote', '> quoted', 'quoted'],
    ['a bullet', '- item one\n- item two', 'item one'],
    ['a numbered item', '1. first', 'first'],
    ['a task item', '- [x] done\n- [ ] todo', 'done'],
    [
      'emphasis',
      '**bold** and *em* and _under_ and ~~gone~~',
      'bold and em and under and gone',
    ],
    ['snake_case words', 'use git_worktree here', 'use git_worktree here'],
    ['a code span', 'run `npm test` now', 'run npm test now'],
    [
      'a link',
      'see [the docs](https://example.com) first',
      'see the docs first',
    ],
    ['an image', '![alt text](/a.png) caption', 'alt text caption'],
    ['inline html', 'a <b>bold</b> <img src=x> word', 'a bold word'],
    [
      'a code fence as the first line',
      '```ts\nconst a = 1\n```',
      'const a = 1',
    ],
    ['a rule as the first line', '---\ntext', 'text'],
    ['collapsed whitespace', '  a   b\tc  ', 'a b c'],
  ])('reads %s as plain text', (_, body, expected) => {
    expect(ideaDescription(body)).toBe(expected)
  })

  it.each([
    ['no body', null],
    ['an empty body', ''],
    ['only whitespace', ' \n\t'],
    ['only markers', '#\n> \n```'],
  ])('returns null for %s', (_, body) => {
    expect(ideaDescription(body)).toBeNull()
  })

  it('keeps a description at the limit intact', () => {
    const body = 'あ'.repeat(MAX_DESCRIPTION_LENGTH)
    expect(ideaDescription(body)).toBe(body)
  })

  it('cuts a longer description by characters, not bytes, and adds an ellipsis', () => {
    const body = '😀'.repeat(MAX_DESCRIPTION_LENGTH + 5)
    const description = ideaDescription(body)
    expect(Array.from(description ?? '')).toHaveLength(MAX_DESCRIPTION_LENGTH)
    expect(description?.endsWith('…')).toBe(true)
  })
})

describe('ideaPageTitle', () => {
  it('uses the title when there is one', () => {
    expect(
      ideaPageTitle({ title: 'Greeting', createdAtLabel: '2026.09.12 10:02' })
    ).toBe('Greeting')
  })

  it('falls back to the timestamp label for an untitled idea', () => {
    expect(
      ideaPageTitle({ title: null, createdAtLabel: '2026.09.12 10:02' })
    ).toBe('Idea 2026.09.12 10:02')
  })
})

describe('formatIdeaTimestamp', () => {
  it('formats in Asia/Tokyo by default', () => {
    expect(formatIdeaTimestamp('2026-09-12T01:02:03.456Z')).toBe(
      '2026.09.12 10:02'
    )
  })

  it('rolls the date forward when the zone crosses midnight', () => {
    expect(formatIdeaTimestamp('2026-12-31T15:00:00.000Z')).toBe(
      '2027.01.01 00:00'
    )
  })

  it('uses two-digit 24-hour time', () => {
    expect(formatIdeaTimestamp('2026-09-12T14:05:00.000Z', 'UTC')).toBe(
      '2026.09.12 14:05'
    )
  })
})
