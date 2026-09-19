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
  IdeaDraft,
  MAX_BODY_BYTES,
  canSubmit,
  deleteIdea,
  fetchIdeas,
  requestByteLength,
  updateIdea,
} from '@/lib/ideas/client'
import {
  UNTITLED_LABEL,
  formatIdeaTimestamp,
  ideaExcerpt,
} from '@/lib/ideas/format'
import {
  Idea,
  MAX_TITLE_LENGTH,
  normalizeBody,
  normalizeTitle,
} from '@/lib/ideas/types'

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

  // A deleted row unmounts, so its outcome is reported here instead.
  const [deleteNotice, setDeleteNotice] = React.useState<
    { kind: 'none' } | { kind: 'deleted'; revalidated: boolean }
  >({ kind: 'none' })

  const handleLoad = async () => {
    setDeleteNotice({ kind: 'none' })
    setList({ kind: 'loading' })
    const result = await fetchIdeas(secret, fetch)
    if (result.ok) {
      setList({ kind: 'loaded', ideas: result.ideas })
      return
    }
    setList({ kind: 'error', message: result.message })
  }

  const handleUpdated = (id: string, draft: IdeaDraft, updatedAt: string) => {
    // The server stores the title normalized and a blank body as null, so
    // the list does the same.
    const title = normalizeTitle(draft.title)
    const body = normalizeBody(draft.body)
    setList((current) =>
      current.kind === 'loaded'
        ? {
            kind: 'loaded',
            ideas: current.ideas.map((idea) =>
              idea.id === id ? { ...idea, title, body, updatedAt } : idea
            ),
          }
        : current
    )
  }

  const handleDeleted = (id: string, revalidated: boolean) => {
    setDeleteNotice({ kind: 'deleted', revalidated })
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
      {deleteNotice.kind === 'deleted' && (
        <p role='status' className='m-0 text-sm text-primary'>
          {deleteNotice.revalidated
            ? '削除しました。'
            : '削除しました。ページへの反映は最大 1 日後になります。'}
        </p>
      )}
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
  | { kind: 'editing'; draft: IdeaDraft }
  | { kind: 'saving'; draft: IdeaDraft }
  | { kind: 'confirming' }
  | { kind: 'deleting' }

type Notice =
  | { kind: 'none' }
  | { kind: 'saved'; revalidated: boolean }
  | { kind: 'error'; message: string }

type RowProps = {
  idea: Idea
  secret: string
  onUpdated: (id: string, draft: IdeaDraft, updatedAt: string) => void
  onDeleted: (id: string, revalidated: boolean) => void
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
    // Ideas saved before titles existed start with an empty title, which
    // has to be filled in before the edit can be saved.
    setMode({
      kind: 'editing',
      draft: { title: idea.title ?? '', body: idea.body ?? '' },
    })
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
    if (!canSubmit({ secret, draft, busy: false })) {
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
      // The row unmounts when the parent drops the idea from its list, so
      // the parent shows the outcome (including a failed regeneration).
      onDeleted(idea.id, result.revalidated)
      return
    }
    setNotice({ kind: 'error', message: result.message })
    setMode({ kind: 'view' })
  }

  if (mode.kind === 'editing' || mode.kind === 'saving') {
    const busy = mode.kind === 'saving'
    const draft = mode.draft
    const bytes = requestByteLength(draft)
    return (
      <form
        onSubmit={handleSave}
        className='flex flex-col gap-3 rounded-lg bg-card p-4 shadow-soft-glow'
      >
        <RowHeader idea={idea} />
        <label className='flex flex-col gap-1 text-sm text-muted-foreground'>
          タイトル
          <input
            type='text'
            value={draft.title}
            onChange={(event) =>
              setMode({
                kind: 'editing',
                draft: { ...draft, title: event.target.value },
              })
            }
            maxLength={MAX_TITLE_LENGTH}
            disabled={busy}
            className={fieldClass}
          />
        </label>
        <label className='flex flex-col gap-1 text-sm text-muted-foreground'>
          本文（Markdown、任意）
          <textarea
            value={draft.body}
            onChange={(event) =>
              setMode({
                kind: 'editing',
                draft: { ...draft, body: event.target.value },
              })
            }
            rows={8}
            disabled={busy}
            className={cn(fieldClass, 'font-mono leading-relaxed')}
          />
        </label>
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
              disabled={!canSubmit({ secret, draft, busy })}
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
      <div className='flex flex-col gap-1'>
        <p
          className={cn(
            'm-0 truncate text-sm',
            idea.title ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {idea.title || UNTITLED_LABEL}
        </p>
        <p className='m-0 truncate text-xs text-muted-foreground'>
          {ideaExcerpt(idea.body)}
        </p>
      </div>
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
        : '保存しました。ページへの反映は最大 1 日後になります。'}{' '}
      <Link href={`/ideas/${idea.id}`} className='underline underline-offset-4'>
        ページを見る
      </Link>
    </p>
  )
}
