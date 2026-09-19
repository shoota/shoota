import { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'
import type { CareerEntry } from '@/lib/profile'

type SectionProps = PropsWithChildren<{
  label: string
  className?: string
}>

/** 見出し（小さなラベル + 罫線）つきのひとまとまり */
export const ProfileSection: React.FC<SectionProps> = ({
  label,
  className,
  children,
}) => {
  return (
    <section className={cn('mx-auto mb-12 w-full', className)}>
      <h2 className='m-0 mb-6 w-full border-b border-muted-foreground/40 pb-2 text-xl uppercase tracking-[0.3em] text-primary'>
        {label}
      </h2>
      {children}
    </section>
  )
}

const cardClassName =
  'overflow-hidden rounded-lg bg-card p-6 shadow-soft-glow sm:p-10 transition-shadow duration-[1500ms] hover:shadow-strong-glow'

const bulletListClassName =
  'm-0 flex list-disc flex-col gap-1 pl-5 text-sm leading-[1.6] text-foreground marker:text-primary/70 [text-shadow:var(--text-shadow-light-blur)]'

const subheadingClassName =
  'm-0 text-lg font-normal tracking-[0.2em] text-accent [text-shadow:var(--text-shadow-glow)]'

/**
 * 説明と、短い項目の箇条書きを並べたカード。広い画面では説明と箇条書きを
 * 5:3 の幅で左右に置き、間を縦の線で区切る。説明は 1 文を 1 行として、
 * 間を空けずに置く。
 */
export const ProfileListCard: React.FC<{
  paragraphsLabel: string
  paragraphs: string[]
  itemsLabel: string
  items: string[]
}> = ({ paragraphsLabel, paragraphs, itemsLabel, items }) => {
  return (
    <div className={cn(cardClassName, 'grid gap-x-8 gap-y-8 lg:grid-cols-8')}>
      <div className='flex flex-col gap-3 lg:col-span-5'>
        <h3 className={subheadingClassName}>{paragraphsLabel}</h3>
        <div className='flex flex-col'>
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className='m-0 text-sm leading-[1.85] text-foreground [text-shadow:var(--text-shadow-light-blur)]'
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      {/* 横に並ぶ広い画面でだけ、説明との間を縦の線で区切る */}
      <div className='flex flex-col gap-3 lg:col-span-3 lg:border-l lg:border-muted-foreground/40 lg:pl-8'>
        <h3 className={subheadingClassName}>{itemsLabel}</h3>
        <ul className={bulletListClassName}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * 経歴。新しい順に、縦の線でつないで並べる。広い画面では前半を左、後半を右の
 * 2 カラムに分ける（左を上から読んで、右へ続く）。
 */
export const CareerCard: React.FC<{ entries: CareerEntry[] }> = ({
  entries,
}) => {
  // 奇数のときは右を多くする（大きく見せる現在の所属が左にあるため）
  const half = Math.floor(entries.length / 2)
  const columns = [entries.slice(0, half), entries.slice(half)]
  return (
    <div className={cn(cardClassName, 'grid gap-x-8 lg:grid-cols-2')}>
      {columns.map((column, index) => (
        <ol
          key={column[0].place}
          className={cn(
            'm-0 flex list-none flex-col gap-8 border-l border-muted-foreground/40 p-0 pl-6',
            // 1 カラムに積まれる画面では、線を途切れさせずに次の項目までの間隔をとる
            index === 0 && 'max-lg:pb-8'
          )}
        >
          {column.map(({ period, place, role, items, current }) => (
            <li
              key={place}
              className={cn(
                'relative flex flex-col gap-2',
                // いまの所属は会社名と内容を 1 段ずつ大きく、それ以外はグレー寄りに落として光らせない
                current && '[&_h3]:text-lg [&_ul]:text-base',
                !current &&
                  '[&_h3]:text-muted-foreground [&_h3]:[text-shadow:none] [&_p]:text-muted-foreground [&_p]:[text-shadow:none] [&_ul]:text-muted-foreground [&_ul]:[text-shadow:none]'
              )}
            >
              <span
                aria-hidden='true'
                className='absolute top-1.5 -left-[1.8125rem] size-2.5 rounded-full bg-primary shadow-soft-glow'
              />
              <p className='m-0 text-sm leading-[1.5] text-accent [text-shadow:var(--text-shadow-glow)]'>
                {period}
              </p>
              <h3 className='m-0 text-base font-bold leading-snug text-accent [text-shadow:var(--text-shadow-glow)]'>
                {place}
                {role ? (
                  <span className='ml-3 text-sm font-normal'>{role}</span>
                ) : null}
              </h3>
              <ul className={bulletListClassName}>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ))}
    </div>
  )
}
