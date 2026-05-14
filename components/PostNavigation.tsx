import Link from 'next/link'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export type NavPost = {
  slug: string
  title: string
}

type Props = {
  prev: NavPost | null
  next: NavPost | null
}

const PostNavigation = ({ prev, next }: Props) => {
  if (!prev && !next) return null
  return (
    <nav className='mx-auto mt-16 grid w-full max-w-5xl gap-4 sm:grid-cols-2'>
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className='group block cursor-pointer no-underline focus:outline-none'
        >
          <Card size='sm' className='h-full'>
            <CardHeader>
              <p className='m-0 text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                ← 新しい記事
              </p>
              <CardTitle className='text-base text-foreground group-hover:text-primary group-focus:text-primary'>
                {prev.title}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className='group block cursor-pointer no-underline focus:outline-none'
        >
          <Card size='sm' className='h-full'>
            <CardHeader>
              <p className='m-0 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                古い記事 →
              </p>
              <CardTitle className='text-right text-base text-foreground group-hover:text-primary group-focus:text-primary'>
                {next.title}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export default PostNavigation
