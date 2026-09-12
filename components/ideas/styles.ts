import { cn } from '@/lib/utils'

/** Form controls shared by the admin page's composer and manager. */

export const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

export const buttonClass =
  'inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export const primaryButtonClass = cn(
  buttonClass,
  'border-primary bg-primary text-primary-foreground hover:opacity-90'
)

export const secondaryButtonClass = cn(
  buttonClass,
  'border-border bg-transparent text-foreground hover:border-primary hover:text-primary'
)

export const dangerButtonClass = cn(
  buttonClass,
  'border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground'
)
