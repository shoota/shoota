import * as React from 'react'

import { cn } from '@/lib/utils'
import { Picture } from '@/components/blog/picture'

/**
 * <Article /> — the gymnopédies article card.
 *
 * This is the v1 `core/Card` component, brought back as a blog primitive
 * (the shadcn-flavoured `ui/Card` is intentionally separate). Props, defaults
 * and text styling match the legacy implementation:
 *
 *   - dark teal surface (`bg-card`) with a soft glow shadow
 *   - 16:9 image header rendered through gymnopédies' <Picture /> so the
 *     legacy grayscale → hover-reveal animation is preserved
 *   - serif heading in `--accent` with a gold glow shadow
 *   - body copy in `--foreground` with a light-blur text shadow
 *   - optional supplementary `content` paragraph in `--accent` (xs)
 */

export type ArticleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ArticleProps = {
  title: string
  /** タイトルの上に出す小さなラベル */
  label?: string
  description: string
  content?: string
  size?: ArticleSize
  /** `horizontal` は sm 以上で左に画像・右に本文を並べる（sm 未満は縦積み） */
  orientation?: 'vertical' | 'horizontal'
  image?: {
    src: string
    alt: string
    caption?: React.ReactNode
  }
  className?: string
  titleClassName?: string
}

const sizeMaxWidth: Record<ArticleSize, string> = {
  xs: 'max-w-[12rem]', // 192px
  sm: 'max-w-[20rem]', // 320px
  md: 'max-w-[28rem]', // 448px
  lg: 'max-w-[36rem]', // 576px
  xl: 'max-w-[48rem]', // 768px
}

export function Article({
  title,
  label,
  description,
  content,
  size = 'sm',
  orientation = 'vertical',
  image,
  className,
  titleClassName,
}: ArticleProps) {
  return (
    <article
      className={cn(
        'group/article flex w-full flex-col overflow-hidden rounded-lg bg-card shadow-soft-glow',
        sizeMaxWidth[size],
        orientation === 'horizontal' && 'sm:flex-row',
        className
      )}
    >
      {image && (
        <div
          className={cn(
            'aspect-[16/9] w-full overflow-hidden',
            orientation === 'horizontal' &&
              'sm:relative sm:aspect-auto sm:w-2/5 sm:shrink-0'
          )}
        >
          <Picture
            className={cn(
              'h-full rounded-none bg-card',
              // 画像の元の縦横比がカードの高さを押し広げないよう、横並びでは枠に貼り付ける
              orientation === 'horizontal' && 'sm:absolute sm:inset-0'
            )}
          >
            <Picture.Image
              src={image.src}
              alt={image.alt}
              // フィルターの解除は画像単体ではなくカード全体の hover / focus に反応させる
              className={cn(
                'h-full rounded-none',
                'group-hover/article:opacity-100 group-hover/article:grayscale-[60%] group-hover/article:duration-1000',
                'group-focus-within/article:opacity-100 group-focus-within/article:grayscale-[60%] group-focus-within/article:duration-1000',
                'group-focus:opacity-100 group-focus:grayscale-[60%] group-focus:duration-1000'
              )}
            />
            {image.caption ? (
              <Picture.Caption>{image.caption}</Picture.Caption>
            ) : null}
          </Picture>
        </div>
      )}
      <div
        className={cn(
          'flex flex-col gap-3 p-6',
          orientation === 'horizontal' && 'sm:min-w-0 sm:flex-1 sm:py-10'
        )}
      >
        {label ? (
          <p className='m-0 w-full border-b border-muted-foreground/40 pb-1 text-xs uppercase tracking-[0.3em] text-primary'>
            {label}
          </p>
        ) : null}
        <h3
          className={cn(
            'm-0 text-xl font-bold leading-tight text-accent',
            '[text-shadow:var(--text-shadow-glow)]',
            titleClassName
          )}
        >
          {title}
        </h3>
        <div
          className={cn(
            'flex flex-col gap-3',
            orientation === 'horizontal' && 'sm:my-auto'
          )}
        >
          <p
            className={cn(
              'm-0 text-base leading-[1.5] text-foreground',
              '[text-shadow:var(--text-shadow-light-blur)]'
            )}
          >
            {description}
          </p>
          {content ? (
            <p
              className={cn(
                'm-0 text-xs leading-[1.5] text-accent',
                '[text-shadow:var(--text-shadow-glow)]'
              )}
            >
              {content}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
