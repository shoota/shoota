import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PostIdeaResponse, handlePostIdea } from '@/lib/ideas/api'
import { loadLatest, saveSnapshot } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'

vi.mock('@/lib/ideas/store', () => ({
  loadLatest: vi.fn(),
  saveSnapshot: vi.fn(),
}))

const SECRET = 'test-secret-value'

const existing: Idea = {
  id: '20260911T000000000Z-000000',
  body: 'older',
  createdAt: '2026-09-11T00:00:00.000Z',
  updatedAt: '2026-09-11T00:00:00.000Z',
}

type RequestInit = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

function makeRequest({
  method = 'POST',
  headers = {},
  body,
}: RequestInit = {}): NextApiRequest {
  return { method, headers, body } as unknown as NextApiRequest
}

function makeResponse() {
  const state = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    json: undefined as PostIdeaResponse | undefined,
    revalidate: vi.fn<(path: string) => Promise<void>>(),
  }
  const res = {
    status(code: number) {
      state.statusCode = code
      return res
    },
    json(payload: PostIdeaResponse) {
      state.json = payload
      return res
    },
    setHeader(name: string, value: string) {
      state.headers[name] = value
      return res
    },
    revalidate: state.revalidate,
  }
  return { res: res as unknown as NextApiResponse<PostIdeaResponse>, state }
}

function authorized(extra: RequestInit = {}) {
  return makeRequest({
    ...extra,
    headers: {
      authorization: `Bearer ${SECRET}`,
      'content-type': 'application/json',
      ...extra.headers,
    },
  })
}

beforeEach(() => {
  vi.stubEnv('IDEAS_POST_SECRET', SECRET)
  vi.mocked(loadLatest).mockReset().mockResolvedValue([existing])
  vi.mocked(saveSnapshot).mockReset().mockResolvedValue('ideas/x.json')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('handlePostIdea', () => {
  it('rejects non-POST methods with 405 and Allow', async () => {
    const { res, state } = makeResponse()
    await handlePostIdea(makeRequest({ method: 'GET' }), res)
    expect(state.statusCode).toBe(405)
    expect(state.headers.Allow).toBe('POST')
    expect(saveSnapshot).not.toHaveBeenCalled()
  })

  describe('authentication', () => {
    it.each([
      ['no header', {}],
      ['wrong secret', { authorization: 'Bearer not-the-secret' }],
      ['secret in query-style header', { authorization: SECRET }],
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

    it('returns 401 when IDEAS_POST_SECRET is unset, even with a token', async () => {
      vi.stubEnv('IDEAS_POST_SECRET', undefined)
      const { res, state } = makeResponse()
      await handlePostIdea(authorized({ body: { body: 'hello' } }), res)
      expect(state.statusCode).toBe(401)
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('returns 415 for a non-JSON content type', async () => {
      const { res, state } = makeResponse()
      await handlePostIdea(
        authorized({ headers: { 'content-type': 'text/plain' }, body: 'x' }),
        res
      )
      expect(state.statusCode).toBe(415)
      expect(saveSnapshot).not.toHaveBeenCalled()
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
      expect(saveSnapshot).not.toHaveBeenCalled()
      expect(state.revalidate).not.toHaveBeenCalled()
    })
  })

  describe('success', () => {
    it('appends the idea, saves a snapshot, and revalidates the feed', async () => {
      const { res, state } = makeResponse()
      state.revalidate.mockResolvedValue()

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      expect(state.statusCode).toBe(201)
      const json = state.json as { id: string; createdAt: string }
      expect(json.id).toMatch(/^\d{8}T\d{9}Z-[0-9a-f]{6}$/)
      expect(Date.parse(json.createdAt)).not.toBeNaN()
      expect(state.json).toEqual({
        id: json.id,
        createdAt: json.createdAt,
        revalidated: true,
      })

      expect(saveSnapshot).toHaveBeenCalledTimes(1)
      const [saved, now] = vi.mocked(saveSnapshot).mock.calls[0]
      expect(saved).toEqual([
        existing,
        {
          id: json.id,
          body: '# new idea',
          createdAt: json.createdAt,
          updatedAt: json.createdAt,
        },
      ])
      expect(now?.toISOString()).toBe(json.createdAt)
      expect(state.revalidate).toHaveBeenCalledWith('/ideas')
    })

    it('reports revalidated: false when regeneration fails after saving', async () => {
      const { res, state } = makeResponse()
      state.revalidate.mockRejectedValue(new Error('revalidate down'))

      await handlePostIdea(authorized({ body: { body: 'x' } }), res)

      expect(state.statusCode).toBe(201)
      expect(state.json).toEqual(
        expect.objectContaining({ revalidated: false })
      )
      expect(saveSnapshot).toHaveBeenCalledTimes(1)
    })
  })

  describe('failure', () => {
    it('returns 500 without details when saving fails, and skips revalidate', async () => {
      vi.mocked(saveSnapshot).mockRejectedValue(new Error('blob exploded'))
      const { res, state } = makeResponse()

      await handlePostIdea(authorized({ body: { body: 'x' } }), res)

      expect(state.statusCode).toBe(500)
      expect(state.json).toEqual({ error: 'internal' })
      expect(state.revalidate).not.toHaveBeenCalled()
      const logged = vi.mocked(console.error).mock.calls.map((c) => c.join(' '))
      expect(logged.join('\n')).not.toContain('blob exploded')
      expect(logged.join('\n')).not.toContain(SECRET)
    })
  })
})
