import Link from 'next/link'
import * as React from 'react'
import { useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'
import {
  MAX_BODY_BYTES,
  bodyByteLength,
  canSubmit,
  clearSecret,
  fetchSnapshot,
  postIdea,
  readSecret,
  writeSecret,
} from '@/lib/ideas/client'

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; id: string; revalidated: boolean }
  | { kind: 'error'; message: string }

type DownloadState =
  | { kind: 'idle' }
  | { kind: 'downloading' }
  | { kind: 'error'; message: string }

function storage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

// The stored secret is exposed as an external store so the component can
// read it after hydration without a setState-in-effect. Writes from this tab
// notify listeners directly; the `storage` event covers other tabs.
const secretListeners = new Set<() => void>()

function subscribeSecret(listener: () => void) {
  secretListeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    secretListeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function emitSecretChange() {
  secretListeners.forEach((listener) => listener())
}

function getSecretSnapshot() {
  return readSecret(storage())
}

function getServerSecretSnapshot() {
  return undefined
}

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

const buttonClass =
  'inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-40'

const primaryButtonClass = cn(
  buttonClass,
  'border-primary bg-primary text-primary-foreground hover:opacity-90'
)

const secondaryButtonClass = cn(
  buttonClass,
  'border-border bg-transparent text-foreground hover:border-primary hover:text-primary'
)

export const IdeaComposer: React.FC = () => {
  // The secret lives in this browser's localStorage. The server snapshot is
  // always undefined, so server-rendered markup never depends on it.
  const secret = useSyncExternalStore(
    subscribeSecret,
    getSecretSnapshot,
    getServerSecretSnapshot
  )
  const [secretInput, setSecretInput] = useState('')

  const [body, setBody] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' })
  const [downloadState, setDownloadState] = useState<DownloadState>({
    kind: 'idle',
  })

  const busy = submitState.kind === 'submitting'
  const bytes = bodyByteLength(body)
  const submittable = canSubmit({ secret, body, busy })

  const handleSaveSecret = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    writeSecret(storage(), secretInput)
    emitSecretChange()
    setSecretInput('')
  }

  const handleClearSecret = () => {
    clearSecret(storage())
    emitSecretChange()
    setSecretInput('')
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submittable || secret === undefined) {
      return
    }
    setSubmitState({ kind: 'submitting' })
    const result = await postIdea(secret, body, fetch)
    if (result.ok) {
      setBody('')
      setSubmitState({
        kind: 'success',
        id: result.id,
        revalidated: result.revalidated,
      })
      return
    }
    setSubmitState({ kind: 'error', message: result.message })
  }

  const handleDownload = async () => {
    if (secret === undefined || downloadState.kind === 'downloading') {
      return
    }
    setDownloadState({ kind: 'downloading' })
    const result = await fetchSnapshot(secret, fetch)
    if (!result.ok) {
      setDownloadState({ kind: 'error', message: result.message })
      return
    }
    // The store is private, so the file is fetched with the secret and
    // handed to the browser as a temporary object URL.
    const url = URL.createObjectURL(
      new Blob([result.json], { type: 'application/json' })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = result.filename
    anchor.click()
    URL.revokeObjectURL(url)
    setDownloadState({ kind: 'idle' })
  }

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-10'>
      <section className='flex flex-col gap-3'>
        <h3 className='m-0 text-base text-accent'>投稿用の秘密</h3>
        {secret === undefined ? (
          <form onSubmit={handleSaveSecret} className='flex flex-col gap-3'>
            <label className='flex flex-col gap-1 text-sm text-muted-foreground'>
              この端末に保存する秘密
              <input
                type='password'
                autoComplete='off'
                value={secretInput}
                onChange={(event) => setSecretInput(event.target.value)}
                className={fieldClass}
              />
            </label>
            <button
              type='submit'
              disabled={secretInput.trim().length === 0}
              className={secondaryButtonClass}
            >
              この端末に保存
            </button>
          </form>
        ) : (
          <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
            <span>保存済み（この端末の localStorage）</span>
            <button
              type='button'
              onClick={handleClearSecret}
              className={secondaryButtonClass}
            >
              クリア
            </button>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <label className='flex flex-col gap-1 text-sm text-muted-foreground'>
          本文（Markdown）
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={10}
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
            {bytes.toLocaleString()} / {MAX_BODY_BYTES.toLocaleString()} bytes
          </span>
          <button
            type='submit'
            disabled={!submittable}
            className={primaryButtonClass}
          >
            {busy ? '送信中…' : '投稿する'}
          </button>
        </div>
        {secret === undefined && (
          <p className='m-0 text-xs text-muted-foreground'>
            秘密を保存すると投稿できます。
          </p>
        )}
        <SubmitStatus state={submitState} />
      </form>

      <section className='flex flex-col gap-3 border-t border-border pt-6'>
        <h3 className='m-0 text-base text-accent'>バックアップ</h3>
        <p className='m-0 text-sm text-muted-foreground'>
          最新のスナップショット JSON をこの端末にダウンロードします。
        </p>
        <div className='flex flex-wrap items-center gap-3'>
          <button
            type='button'
            onClick={handleDownload}
            disabled={
              secret === undefined || downloadState.kind === 'downloading'
            }
            className={secondaryButtonClass}
          >
            {downloadState.kind === 'downloading'
              ? '取得中…'
              : '最新スナップショットをダウンロード'}
          </button>
          {downloadState.kind === 'error' && (
            <span role='alert' className='text-sm text-destructive'>
              {downloadState.message}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}

const SubmitStatus: React.FC<{ state: SubmitState }> = ({ state }) => {
  if (state.kind === 'idle' || state.kind === 'submitting') {
    return null
  }
  if (state.kind === 'error') {
    return (
      <p role='alert' className='m-0 text-sm text-destructive'>
        {state.message}
      </p>
    )
  }
  return (
    <p role='status' className='m-0 text-sm text-primary'>
      {state.revalidated
        ? '投稿しました。'
        : '保存しました。フィードへの反映は最大 1 時間後になります。'}{' '}
      <Link href='/ideas' className='underline underline-offset-4'>
        フィードを見る
      </Link>
    </p>
  )
}
