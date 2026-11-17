import { describe, expect, it } from 'vitest'

import { CardClick, shouldOpenCard } from '@/lib/ideas/cardClick'

const plainClick: CardClick = {
  defaultPrevented: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  onInteractive: false,
  hasSelection: false,
}

describe('shouldOpenCard', () => {
  it('opens the card on a plain primary click', () => {
    expect(shouldOpenCard(plainClick)).toBe(true)
  })

  it('leaves clicks on links and controls to those elements', () => {
    expect(shouldOpenCard({ ...plainClick, onInteractive: true })).toBe(false)
  })

  it('does not navigate when the click ends a text selection', () => {
    expect(shouldOpenCard({ ...plainClick, hasSelection: true })).toBe(false)
  })

  it('ignores clicks another handler already handled', () => {
    expect(shouldOpenCard({ ...plainClick, defaultPrevented: true })).toBe(
      false
    )
  })

  it('ignores non-primary buttons', () => {
    expect(shouldOpenCard({ ...plainClick, button: 1 })).toBe(false)
    expect(shouldOpenCard({ ...plainClick, button: 2 })).toBe(false)
  })

  it.each(['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const)(
    'ignores clicks with %s held',
    (key) => {
      expect(shouldOpenCard({ ...plainClick, [key]: true })).toBe(false)
    }
  )
})
