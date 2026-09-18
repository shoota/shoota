import { MenuIcon, XIcon as CloseIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type HeaderNavigationMenuItem = {
  name: string
  href: string
}

export type HeaderNavigationSocialLink = {
  name: string
  href: string
  icon: React.ReactNode
}

export type HeaderNavigationProps = React.HTMLAttributes<HTMLElement> & {
  title: string
  menuItems?: HeaderNavigationMenuItem[]
  socialLinks?: HeaderNavigationSocialLink[]
  currentIndex?: number
}

const linkClassName = 'text-muted-foreground hover:text-primary'

// グローバルの a:hover（文字色 + glow）と同じ見た目
const currentClassName = 'text-primary [text-shadow:0_0_4px_var(--color-link)]'

export function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  )
}

export function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
    </svg>
  )
}

function MenuLinks({
  menuItems,
  currentIndex,
  onNavigate,
}: {
  menuItems: HeaderNavigationMenuItem[]
  currentIndex?: number
  onNavigate?: () => void
}) {
  return (
    <>
      {menuItems.map((item, index) => {
        if (index === currentIndex) {
          return (
            <span
              key={`${item.name}-${index}`}
              aria-current='page'
              className={currentClassName}
            >
              {item.name}
            </span>
          )
        }
        return (
          <Link
            key={`${item.name}-${index}`}
            href={item.href}
            onClick={onNavigate}
            className={linkClassName}
          >
            {item.name}
          </Link>
        )
      })}
    </>
  )
}

function SocialLinks({
  socialLinks,
}: {
  socialLinks: HeaderNavigationSocialLink[]
}) {
  return (
    <>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={link.name}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'rounded-xl border-border text-foreground hover:text-primary'
          )}
        >
          {link.icon}
        </a>
      ))}
    </>
  )
}

export function HeaderNavigation({
  title,
  menuItems = [],
  socialLinks = [],
  currentIndex,
  className,
  ...props
}: HeaderNavigationProps) {
  const [open, setOpen] = React.useState(false)
  const hasMenu = menuItems.length > 0 || socialLinks.length > 0

  return (
    <header
      className={cn(
        'mx-0 my-5 flex items-stretch rounded-md border border-border',
        'bg-[rgba(4,37,43,0.4)] bg-[linear-gradient(rgba(214,214,214,0.1)_0%,rgba(4,37,43,0.4)_4%,rgba(4,37,43,0.4)_80%,rgba(4,37,43,0.4)_90%,rgba(214,214,214,0.1)_100%)]',
        'shadow-[0_0_2.5rem_0_rgba(214,214,214,0.3)]',
        className
      )}
      {...props}
    >
      <div className='flex min-w-0 flex-grow items-baseline pt-5 pb-3'>
        <h1 className='m-0 min-w-0 truncate px-4 text-2xl text-accent uppercase [text-shadow:0_0_4px_var(--color-tone)] sm:px-6 md:text-3xl lg:text-4xl'>
          {title}
        </h1>
        {menuItems.length > 0 && (
          <nav className='ml-auto hidden items-baseline gap-5 pr-6 pl-2 text-lg md:flex lg:text-xl'>
            <MenuLinks menuItems={menuItems} currentIndex={currentIndex} />
          </nav>
        )}
      </div>
      {socialLinks.length > 0 && (
        <div className='hidden items-center gap-2 border-l border-border px-4 pt-2 md:flex'>
          <SocialLinks socialLinks={socialLinks} />
        </div>
      )}
      {hasMenu && (
        <div className='flex items-center border-l border-border px-3 pt-2 md:hidden'>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant='ghost' size='icon-lg' aria-label='Open menu' />
              }
            >
              <MenuIcon className='size-5' />
            </SheetTrigger>
            <SheetContent
              side='right'
              showCloseButton={false}
              overlayClassName='bg-black/60'
              className='shadow-[0_0_2.5rem_0_rgba(214,214,214,0.3)]'
            >
              <SheetHeader className='flex-row items-center gap-2 border-b border-border px-4 py-3'>
                <SheetTitle className='sr-only'>{title}</SheetTitle>
                <SheetDescription className='sr-only'>
                  Site navigation
                </SheetDescription>
                <SocialLinks socialLinks={socialLinks} />
                <SheetClose
                  render={
                    <Button
                      variant='ghost'
                      size='icon'
                      className='ml-auto'
                      aria-label='Close menu'
                    />
                  }
                >
                  <CloseIcon />
                </SheetClose>
              </SheetHeader>
              <nav className='flex flex-col gap-5 px-4 text-xl'>
                <MenuLinks
                  menuItems={menuItems}
                  currentIndex={currentIndex}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </header>
  )
}
