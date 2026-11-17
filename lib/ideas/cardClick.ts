/**
 * Decides whether a click on an idea card should open the idea's page.
 * Kept free of DOM and other imports so it can be tested without a browser
 * and stays out of the Markdown pipeline's bundle.
 */

/** Elements inside a card that handle their own clicks. */
export const CARD_INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, summary, label'

export type CardClick = {
  defaultPrevented: boolean
  /** `MouseEvent.button`; 0 is the primary button. */
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  /** The click landed on or inside a link or form control. */
  onInteractive: boolean
  /** Text is selected, so the click was the end of a drag selection. */
  hasSelection: boolean
}

export function shouldOpenCard(click: CardClick): boolean {
  if (click.defaultPrevented) return false
  if (click.button !== 0) return false
  // Modified clicks mean "new tab" or "select"; the timestamp link, a real
  // anchor, serves those.
  if (click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) {
    return false
  }
  if (click.onInteractive) return false
  if (click.hasSelection) return false
  return true
}
