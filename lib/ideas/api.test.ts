import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GetSnapshotResponse,
  PostIdeaResponse,
  handleGetSnapshot,
  handlePostIdea,
} from '@/lib/ideas/api'
import { loadLatest, saveSnapshot } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'
import route, { config } from '@/pages/api/ideas'
import snapshotRoute from '@/pages/api/ideas/snapshot'

vi.mock('@/lib/ideas/store', () => ({
  loadLatest: vi.fn(),
  saveSnapshot: vi.fn(),
}))

const SECRET = 'test-secret-value'
const NOW = new Date('2026-09-12T01:02:03.456Z')

const existing: Idea = {
  id: '20260911T000000000Z-000000',
  body: 'older',
  createdAt: '2026-09-11T00:00:00.000Z',
  updatedAt: '2026-09-11T00:00:00.000Z',
}

type FakeRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string>
  url?: string
}

function makeRequest({
  method = 'POST',
  headers = {},
  body,
  query = {},
  url = '/api/ideas',
}: FakeRequest = {}): NextApiRequest {
  return { method, headers, body, query, url } as unknown as NextApiRequest
}

function makeResponse<T = PostIdeaResponse>() {
  const state = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    json: undefined as T | undefined,
    revalidate: vi.fn<(path: string) => Promise<void>>(),
  }
  const res = {
    status(code: number) {
      state.statusCode = code
      return res
    },
    json(payload: T) {
      state.json = payload
      return res
    },
    setHeader(name: string, value: string) {
      state.headers[name] = value
      return res
    },
    revalidate: state.revalidate,
  }
  return { res: res as unknown as NextApiResponse<T>, state }
}

function authorized(extra: FakeRequest = {}) {
  return makeRequest({
    ...extra,
    headers: {
      authorization: `Bearer ${SECRET}`,
      'content-type': 'application/json',
      ...extra.headers,
    },
  })
}

function loggedText() {
  return vi
    .mocked(console.error)
    .mock.calls.map((call) => call.join(' '))
    .join('\n')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  vi.stubEnv('IDEAS_POST_SECRET', SECRET)
  vi.mocked(loadLatest).mockReset().mockResolvedValue([existing])
  vi.mocked(saveSnapshot).mockReset().mockResolvedValue('ideas/x.json')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('route wiring', () => {
  it('exports the handler as the default export', () => {
    expect(route).toBe(handlePostIdea)
  })

  it('exports the snapshot handler from /api/ideas/snapshot', () => {
    expect(snapshotRoute).toBe(handleGetSnapshot)
  })

  it('caps the request body at 20kb through the body parser', () => {
    expect(config).toEqual({ api: { bodyParser: { sizeLimit: '20kb' } } })
  })
})

describe('handlePostIdea', () => {
  it('rejects non-POST methods with 405 and Allow', async () => {
    const { res, state } = makeResponse()
    await handlePostIdea(makeRequest({ method: 'GET' }), res)
    expect(state.statusCode).toBe(405)
    expect(state.json).toEqual({ error: 'method_not_allowed' })
    expect(state.headers.Allow).toBe('POST')
    expect(saveSnapshot).not.toHaveBeenCalled()
    expect(state.revalidate).not.toHaveBeenCalled()
  })

  describe('authentication', () => {
    it.each([
      ['no header', {}],
      ['wrong secret', { authorization: 'Bearer not-the-secret' }],
      ['missing Bearer scheme', { authorization: SECRET }],
    ])('returns 401 with %s and does not save', async (_, headers) => {
      const { res, state } = makeResponse()
      await handlePostIdea(
        makeRequest({
          headers: { 'content-type': 'application/json', ...headers },
          body: { body: 'hello' },
        }),
        res
      )
      expect(state.statusCode).toBe(401)
      expect(state.json).toEqual({ error: 'unauthorized' })
      expect(state.headers['WWW-Authenticate']).toBe('Bearer')
      expect(loadLatest).not.toHaveBeenCalled()
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })

    it('ignores a secret passed in the query string', async () => {
      const { res, state } = makeResponse()
      await handlePostIdea(
        makeRequest({
          headers: { 'content-type': 'application/json' },
          body: { body: 'hello' },
          query: { token: SECRET, secret: SECRET },
          url: `/api/ideas?token=${SECRET}`,
        }),
        res
      )
      expect(state.statusCode).toBe(401)
      expect(saveSnapshot).not.toHaveBeenCalled()
    })

    it('returns the same 401 when IDEAS_POST_SECRET is unset', async () => {
      vi.stubEnv('IDEAS_POST_SECRET', undefined)
      const { res, state } = makeResponse()
      await handlePostIdea(authorized({ body: { body: 'hello' } }), res)
      expect(state.statusCode).toBe(401)
      expect(state.json).toEqual({ error: 'unauthorized' })
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it.each([
      ['text/plain', 'text/plain'],
      ['a missing header', undefined],
      ['an array header', ['text/plain', 'application/json']],
    ])('returns 415 for %s', async (_, contentType) => {
      const { res, state } = makeResponse()
      await handlePostIdea(
        authorized({
          headers: { 'content-type': contentType },
          body: { body: 'x' },
        }),
        res
      )
      expect(state.statusCode).toBe(415)
      expect(state.json).toEqual({ error: 'unsupported_media_type' })
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })

    it('accepts application/json with a charset parameter', async () => {
      const { res, state } = makeResponse()
      await handlePostIdea(
        authorized({
          headers: { 'content-type': 'Application/JSON; charset=utf-8' },
          body: { body: 'hello' },
        }),
        res
      )
      expect(state.statusCode).toBe(201)
    })

    it.each([
      ['missing body field', {}],
      ['empty string', { body: '' }],
      ['whitespace only', { body: '   \n' }],
      ['non-string', { body: 42 }],
      ['not an object', 'hello'],
      ['null', null],
    ])('returns 400 for %s', async (_, body) => {
      const { res, state } = makeResponse()
      await handlePostIdea(authorized({ body }), res)
      expect(state.statusCode).toBe(400)
      expect(state.json).toEqual({ error: 'body_required' })
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })
  })

  describe('success', () => {
    const created = {
      body: '# new idea',
      createdAt: '2026-09-12T01:02:03.456Z',
      updatedAt: '2026-09-12T01:02:03.456Z',
    }

    it('appends the idea, saves a snapshot, and revalidates the feed', async () => {
      const { res, state } = makeResponse()
      state.revalidate.mockResolvedValue()

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      expect(state.statusCode).toBe(201)
      expect(state.json).toEqual({
        id: expect.stringMatching(/^20260912T010203456Z-[0-9a-f]{6}$/),
        createdAt: created.createdAt,
        revalidated: true,
      })
      const id = (state.json as { id: string }).id

      expect(saveSnapshot).toHaveBeenCalledTimes(1)
      expect(saveSnapshot).toHaveBeenCalledWith(
        [existing, { id, ...created }],
        NOW
      )
      expect(state.revalidate).toHaveBeenCalledTimes(1)
      expect(state.revalidate).toHaveBeenCalledWith('/ideas')
    })

    it('starts a snapshot from scratch when there are no ideas yet', async () => {
      vi.mocked(loadLatest).mockResolvedValue([])
      const { res, state } = makeResponse()
      state.revalidate.mockResolvedValue()

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      const id = (state.json as { id: string }).id
      expect(saveSnapshot).toHaveBeenCalledWith([{ id, ...created }], NOW)
    })

    it('reports revalidated: false when regeneration fails after saving', async () => {
      const { res, state } = makeResponse()
      state.revalidate.mockRejectedValue(new Error('revalidate down'))

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      expect(state.statusCode).toBe(201)
      expect(state.json).toEqual({
        id: expect.stringMatching(/^20260912T010203456Z-[0-9a-f]{6}$/),
        createdAt: created.createdAt,
        revalidated: false,
      })
      expect(saveSnapshot).toHaveBeenCalledTimes(1)
      expect(loggedText()).not.toContain('revalidate down')
      expect(loggedText()).not.toContain(SECRET)
    })
  })

  describe('failure', () => {
    it.each([
      ['loading the snapshot', loadLatest],
      ['saving the snapshot', saveSnapshot],
    ])('returns 500 without details when %s fails', async (_, fn) => {
      vi.mocked(fn).mockRejectedValue(new Error('blob exploded'))
      const { res, state } = makeResponse()

      await handlePostIdea(authorized({ body: { body: 'x' } }), res)

      expect(state.statusCode).toBe(500)
      expect(state.json).toEqual({ error: 'internal' })
      expect(state.revalidate).not.toHaveBeenCalled()
      expect(loggedText()).toContain('Error')
      expect(loggedText()).not.toContain('blob exploded')
      expect(loggedText()).not.toContain(SECRET)
    })
  })
})

describe('handleGetSnapshot', () => {
  function getRequest(headers: Record<string, string | undefined> = {}) {
    return makeRequest({ method: 'GET', headers })
  }

  it('rejects non-GET methods with 405 and Allow', async () => {
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(makeRequest({ method: 'POST' }), res)
    expect(state.statusCode).toBe(405)
    expect(state.json).toEqual({ error: 'method_not_allowed' })
    expect(state.headers.Allow).toBe('GET')
    expect(loadLatest).not.toHaveBeenCalled()
  })

  it.each([
    ['no header', {}],
    ['wrong secret', { authorization: 'Bearer not-the-secret' }],
    ['missing Bearer scheme', { authorization: SECRET }],
  ])('returns 401 with %s and does not read the store', async (_, headers) => {
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(getRequest(headers), res)
    expect(state.statusCode).toBe(401)
    expect(state.json).toEqual({ error: 'unauthorized' })
    expect(state.headers['WWW-Authenticate']).toBe('Bearer')
    expect(loadLatest).not.toHaveBeenCalled()
  })

  it('returns 401 when IDEAS_POST_SECRET is unset', async () => {
    vi.stubEnv('IDEAS_POST_SECRET', undefined)
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(
      getRequest({ authorization: `Bearer ${SECRET}` }),
      res
    )
    expect(state.statusCode).toBe(401)
    expect(loadLatest).not.toHaveBeenCalled()
  })

  it('returns the latest snapshot as a downloadable JSON array', async () => {
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(
      getRequest({ authorization: `Bearer ${SECRET}` }),
      res
    )
    expect(state.statusCode).toBe(200)
    expect(state.json).toEqual([existing])
    expect(state.headers['Cache-Control']).toBe('no-store')
    expect(state.headers['Content-Disposition']).toBe(
      'attachment; filename="ideas-20260912T010203456Z.json"'
    )
  })

  it('returns an empty array when there are no ideas', async () => {
    vi.mocked(loadLatest).mockResolvedValue([])
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(
      getRequest({ authorization: `Bearer ${SECRET}` }),
      res
    )
    expect(state.statusCode).toBe(200)
    expect(state.json).toEqual([])
  })

  it('returns 500 without details when loading fails', async () => {
    vi.mocked(loadLatest).mockRejectedValue(new Error('blob exploded'))
    const { res, state } = makeResponse<GetSnapshotResponse>()
    await handleGetSnapshot(
      getRequest({ authorization: `Bearer ${SECRET}` }),
      res
    )
    expect(state.statusCode).toBe(500)
    expect(state.json).toEqual({ error: 'internal' })
    expect(loggedText()).not.toContain('blob exploded')
    expect(loggedText()).not.toContain(SECRET)
  })
})
