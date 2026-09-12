import Link from 'next/link'
import * as React from 'react'

import {
  dangerButtonClass,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ideas/styles'
import { cn } from '@/lib/utils'
import {
  MAX_BODY_BYTES,
  canSubmit,
  deleteIdea,
  fetchIdeas,
  requestByteLength,
  updateIdea,
} from '@/lib/ideas/client'
import { formatIdeaTimestamp, ideaExcerpt } from '@/lib/ideas/format'
import type { Idea } from '@/lib/ideas/types'

type ListState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; ideas: Idea[] }
  | { kind: 'error'; message: string }

type Props = {
  /** The stored secret; the list is only offered once one exists. */
  secret: string
}

/**
 * Admin list of posted ideas with inline edit and two-step delete. The list
 * is loaded on demand through the authenticated snapshot endpoint, so the
 * server-rendered page never includes it and there is nothing to hydrate.
 */
export const IdeaManager: React.FC<Props> = ({ secret }) => {
  const [list, setList] = React.useState<ListState>({ kind: 'idle' })

  const handleLoad = async () => {
    setList({ kind: 'loading' })
    const result = await fetchIdeas(secret, fetch)
    if (result.ok) {
      setList({ kind: 'loaded', ideas: result.ideas })
      return
    }
    setList({ kind: 'error', message: result.message })
  }

  const handleUpdated = (id: string, body: string, updatedAt: string) => {
    setList((current) =>
      current.kind === 'loaded'
        ? {
            kind: 'loaded',
            ideas: current.ideas.map((idea) =>
              idea.id === id ? { ...idea, body, updatedAt } : idea
            ),
          }
        : current
    )
  }

  const handleDeleted = (id: string) => {
    setList((current) =>
      current.kind === 'loaded'
        ? {
            kind: 'loaded',
            ideas: current.ideas.filter((idea) => idea.id !== id),
          }
        : current
    )
  }

  return (
    <section className='flex flex-col gap-4 border-t border-border pt-6'>
      <h3 className='m-0 text-base text-accent'>投稿済みのアイデア</h3>
      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='button'
          onClick={handleLoad}
          disabled={list.kind === 'loading'}
          className={secondaryButtonClass}
        >
          {list.kind === 'loading'
            ? '読み込み中…'
            : list.kind === 'loaded'
              ? '一覧を再読み込み'
              : '一覧を読み込む'}
        </button>
        {list.kind === 'error' && (
          <span role='alert' className='text-sm text-destructive'>
            {list.message}
          </span>
        )}
      </div>
      {list.kind === 'loaded' && list.ideas.length === 0 && (
        <p className='m-0 text-sm text-muted-foreground'>
          まだアイデアはありません。
        </p>
      )}
      {list.kind === 'loaded' && list.ideas.length > 0 && (
        <ul className='m-0 flex list-none flex-col gap-4 p-0'>
          {list.ideas.map((idea) => (
            <li key={idea.id} className='m-0 p-0'>
              <IdeaRow
                idea={idea}
                secret={secret}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type RowMode =
  | { kind: 'view' }
  | { kind: 'editing'; draft: string }
  | { kind: 'saving'; draft: string }
  | { kind: 'confirming' }
  | { kind: 'deleting' }

type Notice =
  | { kind: 'none' }
  | { kind: 'saved'; revalidated: boolean }
  | { kind: 'error'; message: string }

type RowProps = {
  idea: Idea
  secret: string
  onUpdated: (id: string, body: string, updatedAt: string) => void
  onDeleted: (id: string) => void
}

const IdeaRow: React.FC<RowProps> = ({
  idea,
  secret,
  onUpdated,
  onDeleted,
}) => {
  const [mode, setMode] = React.useState<RowMode>({ kind: 'view' })
  const [notice, setNotice] = React.useState<Notice>({ kind: 'none' })

  const handleStartEdit = () => {
    setNotice({ kind: 'none' })
    setMode({ kind: 'editing', draft: idea.body })
  }

  const handleCancel = () => {
    setMode({ kind: 'view' })
  }

  const handleSave = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode.kind !== 'editing') {
      return
    }
    const draft = mode.draft
    if (!canSubmit({ secret, body: draft, busy: false })) {
      return
    }
    setMode({ kind: 'saving', draft })
    // `updatedAt` from the loaded list is sent as a precondition, so a stale
    // row cannot silently overwrite an edit made from another device.
    const result = await updateIdea(
      secret,
      { id: idea.id, expectedUpdatedAt: idea.updatedAt },
      draft,
      fetch
    )
    if (result.ok) {
      onUpdated(idea.id, draft, result.updatedAt)
      setNotice({ kind: 'saved', revalidated: result.revalidated })
      setMode({ kind: 'view' })
      return
    }
    setNotice({ kind: 'error', message: result.message })
    setMode({ kind: 'editing', draft })
  }

  const handleStartDelete = () => {
    setNotice({ kind: 'none' })
    setMode({ kind: 'confirming' })
  }

  const handleConfirmDelete = async () => {
    setMode({ kind: 'deleting' })
    const result = await deleteIdea(
      secret,
      { id: idea.id, expectedUpdatedAt: idea.updatedAt },
      fetch
    )
    if (result.ok) {
      // The row unmounts when the parent drops the idea from its list.
      onDeleted(idea.id)
      return
    }
    setNotice({ kind: 'error', message: result.message })
    setMode({ kind: 'view' })
  }

  if (mode.kind === 'editing' || mode.kind === 'saving') {
    const busy = mode.kind === 'saving'
    const bytes = requestByteLength(mode.draft)
    return (
      <form
        onSubmit={handleSave}
        className='flex flex-col gap-3 rounded-lg bg-card p-4 shadow-soft-glow'
      >
        <RowHeader idea={idea} />
        <textarea
          value={mode.draft}
          onChange={(event) =>
            setMode({ kind: 'editing', draft: event.target.value })
          }
          rows={8}
          disabled={busy}
          className={cn(fieldClass, 'font-mono leading-relaxed')}
        />
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <span
            className={cn(
              'text-xs',
              bytes > MAX_BODY_BYTES
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            送信サイズ {bytes.toLocaleString()} /{' '}
            {MAX_BODY_BYTES.toLocaleString()} bytes
          </span>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleCancel}
              disabled={busy}
              className={secondaryButtonClass}
            >
              キャンセル
            </button>
            <button
              type='submit'
              disabled={!canSubmit({ secret, body: mode.draft, busy })}
              className={primaryButtonClass}
            >
              {busy ? '保存中…' : '保存する'}
            </button>
          </div>
        </div>
        <RowNotice idea={idea} notice={notice} />
      </form>
    )
  }

  return (
    <div className='flex flex-col gap-3 rounded-lg bg-card p-4 shadow-soft-glow'>
      <RowHeader idea={idea} />
      <p className='m-0 truncate text-sm'>{ideaExcerpt(idea.body)}</p>
      {mode.kind === 'view' && (
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={handleStartEdit}
            className={secondaryButtonClass}
          >
            編集
          </button>
          <button
            type='button'
            onClick={handleStartDelete}
            className={dangerButtonClass}
          >
            削除
          </button>
        </div>
      )}
      {(mode.kind === 'confirming' || mode.kind === 'deleting') && (
        <div className='flex flex-wrap items-center gap-3'>
          <span className='text-sm text-destructive'>
            このアイデアを削除します。元に戻せません。
          </span>
          <button
            type='button'
            onClick={handleCancel}
            disabled={mode.kind === 'deleting'}
            className={secondaryButtonClass}
          >
            キャンセル
          </button>
          <button
            type='button'
            onClick={handleConfirmDelete}
            disabled={mode.kind === 'deleting'}
            className={dangerButtonClass}
          >
            {mode.kind === 'deleting' ? '削除中…' : '削除する'}
          </button>
        </div>
      )}
      <RowNotice idea={idea} notice={notice} />
    </div>
  )
}

const RowHeader: React.FC<{ idea: Idea }> = ({ idea }) => {
  return (
    <div className='flex flex-wrap items-baseline justify-between gap-2 text-xs text-accent'>
      <Link
        href={`/ideas/${idea.id}`}
        className='tracking-wider no-underline hover:text-primary hover:underline hover:underline-offset-4'
      >
        <time dateTime={idea.createdAt}>
          {formatIdeaTimestamp(idea.createdAt)}
        </time>
      </Link>
      {idea.updatedAt !== idea.createdAt && (
        <span className='text-muted-foreground'>
          更新 {formatIdeaTimestamp(idea.updatedAt)}
        </span>
      )}
    </div>
  )
}

const RowNotice: React.FC<{ idea: Idea; notice: Notice }> = ({
  idea,
  notice,
}) => {
  if (notice.kind === 'none') {
    return null
  }
  if (notice.kind === 'error') {
    return (
      <p role='alert' className='m-0 text-sm text-destructive'>
        {notice.message}
      </p>
    )
  }
  return (
    <p role='status' className='m-0 text-sm text-primary'>
      {notice.revalidated
        ? '保存しました。'
        : '保存しました。ページへの反映は最大 1 時間後になります。'}{' '}
      <Link href={`/ideas/${idea.id}`} className='underline underline-offset-4'>
        ページを見る
      </Link>
    </p>
  )
}
