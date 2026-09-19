import { PresentationIcon } from 'lucide-react'

import { GitHubIcon, XIcon } from '@/components/blog/header-navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { SOCIAL_URLS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PROFILE } from '@/lib/profile'

const LINKS = [
  { name: 'X', href: SOCIAL_URLS.x, Icon: XIcon },
  { name: 'GitHub', href: SOCIAL_URLS.github, Icon: GitHubIcon },
  {
    name: 'Speaker Deck',
    href: SOCIAL_URLS.speakerDeck,
    Icon: PresentationIcon,
  },
]

/**
 * 名前とリンクをまとめた先頭のカード。面・ラベル・文字の見た目はブログ一覧の
 * 最新記事カードに合わせている。画像は正方形なので切り抜かずに gymnopédies の
 * <Avatar /> で見せる。リンクを中に持つのでカード全体はリンクにしない。
 */
export const ProfileHero: React.FC = () => {
  return (
    <article className='group/article flex w-full flex-col items-center gap-2 overflow-hidden rounded-lg bg-card pt-8 shadow-soft-glow transition-shadow duration-[1500ms] hover:shadow-strong-glow focus-within:shadow-strong-glow sm:flex-row sm:gap-4 sm:pt-0 sm:pl-10'>
      <div className='flex shrink-0 flex-col items-center gap-3'>
        <Avatar className='size-40 shadow-soft-glow sm:size-48'>
          {/* フィルターの解除はブログのカードと同じく、カード全体の hover / focus に反応させる */}
          <AvatarImage
            src={PROFILE.picture}
            alt={PROFILE.name}
            className='opacity-60 grayscale transition-opacity duration-700 group-hover/article:opacity-100 group-hover/article:grayscale-[60%] group-hover/article:duration-1000 group-focus-within/article:opacity-100 group-focus-within/article:grayscale-[60%] group-focus-within/article:duration-1000'
          />
          <AvatarFallback className='text-2xl'>SK</AvatarFallback>
        </Avatar>
        <p className='m-0 text-base text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          @{PROFILE.handle}
        </p>
        <ul className='m-0 flex list-none justify-center gap-3 p-0'>
          {LINKS.map(({ name, href, Icon }) => (
            <li key={name}>
              <a
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={name}
                title={name}
                // ヘッダーナビの SNS ボタンと同じ見た目
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'rounded-xl border-border text-foreground hover:text-primary'
                )}
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className='flex w-full flex-col gap-3 p-6 sm:min-w-0 sm:flex-1 sm:py-10'>
        <h1 className='m-0 text-4xl font-bold leading-tight text-accent [text-shadow:var(--text-shadow-glow)]'>
          {PROFILE.name}
        </h1>
        <p className='m-0 text-sm leading-[1.5] text-accent [text-shadow:var(--text-shadow-glow)]'>
          {PROFILE.nameJa}
        </p>
        <p className='m-0 mt-2 text-base leading-[1.85] text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          {PROFILE.intro.join('')}
        </p>
        <ul className='m-0 mt-2 flex list-none flex-col gap-1 p-0 text-base leading-[1.5] text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          {PROFILE.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <p className='m-0 mt-2 text-base leading-[1.6] text-foreground [text-shadow:var(--text-shadow-light-blur)]'>
          {PROFILE.motto}
        </p>
      </div>
    </article>
  )
}
