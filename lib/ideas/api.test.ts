import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GetSnapshotResponse,
  IdeaByIdResponse,
  PostIdeaResponse,
  handleGetSnapshot,
  handleIdeaById,
  handlePostIdea,
} from '@/lib/ideas/api'
import { loadLatest, pruneSnapshots, saveSnapshot } from '@/lib/ideas/store'
import { Idea } from '@/lib/ideas/types'
import route, { config } from '@/pages/api/ideas'
import byIdRoute, { config as byIdConfig } from '@/pages/api/ideas/[id]'
import snapshotRoute from '@/pages/api/ideas/snapshot'

vi.mock('@/lib/ideas/store', () => ({
  loadLatest: vi.fn(),
  pruneSnapshots: vi.fn(),
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
  query?: Record<string, string | string[] | undefined>
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
  vi.mocked(pruneSnapshots).mockReset().mockResolvedValue([])
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

  it('exports the by-id handler from /api/ideas/[id] with the same body cap', () => {
    expect(byIdRoute).toBe(handleIdeaById)
    expect(byIdConfig).toEqual({ api: { bodyParser: { sizeLimit: '20kb' } } })
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

    it('appends the idea, saves a snapshot, and revalidates the feed and the detail page', async () => {
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
      expect(pruneSnapshots).toHaveBeenCalledTimes(1)
      expect(pruneSnapshots).toHaveBeenCalledWith(NOW)
      expect(
        vi.mocked(pruneSnapshots).mock.invocationCallOrder[0]
      ).toBeGreaterThan(vi.mocked(saveSnapshot).mock.invocationCallOrder[0])
      expect(state.revalidate.mock.calls).toEqual([
        ['/ideas'],
        [`/ideas/${id}`],
      ])
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

    it('still revalidates the detail page when the feed fails, and reports false', async () => {
      const { res, state } = makeResponse()
      state.revalidate
        .mockRejectedValueOnce(new Error('feed down'))
        .mockResolvedValueOnce()

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      const id = (state.json as { id: string }).id
      expect(state.json).toMatchObject({ revalidated: false })
      expect(state.revalidate.mock.calls).toEqual([
        ['/ideas'],
        [`/ideas/${id}`],
      ])
      expect(loggedText()).toContain('/ideas')
      expect(loggedText()).not.toContain('feed down')
    })

    it('reports false when only the detail page fails', async () => {
      const { res, state } = makeResponse()
      state.revalidate
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('detail down'))

      await handlePostIdea(authorized({ body: { body: '# new idea' } }), res)

      expect(state.statusCode).toBe(201)
      expect(state.json).toMatchObject({ revalidated: false })
      expect(state.revalidate).toHaveBeenCalledTimes(2)
    })
  })

  describe('snapshot retention', () => {
    it('still returns 201 and revalidates when pruning fails, logging only the error name', async () => {
      vi.mocked(pruneSnapshots).mockRejectedValue(new Error('blob exploded'))
      const { res, state } = makeResponse()
      state.revalidate.mockResolvedValue()

      await handlePostIdea(authorized({ body: { body: 'x' } }), res)

      expect(state.statusCode).toBe(201)
      expect(state.json).toEqual({
        id: expect.stringMatching(/^20260912T010203456Z-[0-9a-f]{6}$/),
        createdAt: NOW.toISOString(),
        revalidated: true,
      })
      expect(state.revalidate).toHaveBeenCalledTimes(2)
      expect(loggedText()).toContain('prune')
      expect(loggedText()).toContain('Error')
      expect(loggedText()).not.toContain('blob exploded')
      expect(loggedText()).not.toContain(SECRET)
    })

    it('does not prune when the save failed', async () => {
      vi.mocked(saveSnapshot).mockRejectedValue(new Error('blob exploded'))
      const { res } = makeResponse()

      await handlePostIdea(authorized({ body: { body: 'x' } }), res)

      expect(pruneSnapshots).not.toHaveBeenCalled()
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

describe('handleIdeaById', () => {
  const second: Idea = {
    id: '20260912T010203456Z-9f3a1b',
    body: 'newer',
    createdAt: '2026-09-12T01:02:03.456Z',
    updatedAt: '2026-09-12T01:02:03.456Z',
  }

  function putRequest(
    id: string | string[] | undefined,
    body: unknown = { body: 'edited' },
    headers: Record<string, string | undefined> = {}
  ) {
    return makeRequest({
      method: 'PUT',
      url: `/api/ideas/${String(id)}`,
      query: { id },
      body,
      headers: {
        authorization: `Bearer ${SECRET}`,
        'content-type': 'application/json',
        ...headers,
      },
    })
  }

  function deleteRequest(
    id: string | string[] | undefined,
    headers: Record<string, string | undefined> = {}
  ) {
    return makeRequest({
      method: 'DELETE',
      url: `/api/ideas/${String(id)}`,
      query: { id },
      headers: { authorization: `Bearer ${SECRET}`, ...headers },
    })
  }

  beforeEach(() => {
    vi.mocked(loadLatest).mockResolvedValue([existing, second])
  })

  it.each(['GET', 'POST', 'PATCH'])(
    'rejects %s with 405 and Allow',
    async (method) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        makeRequest({
          method,
          query: { id: existing.id },
          headers: { authorization: `Bearer ${SECRET}` },
        }),
        res
      )
      expect(state.statusCode).toBe(405)
      expect(state.headers.Allow).toBe('PUT, DELETE')
      expect(loadLatest).not.toHaveBeenCalled()
    }
  )

  describe('authentication', () => {
    it.each([
      ['no header', undefined],
      ['a wrong secret', 'Bearer nope'],
      ['a non-bearer scheme', `Basic ${SECRET}`],
    ])('returns 401 for PUT with %s', async (_, authorization) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        putRequest(existing.id, undefined, { authorization }),
        res
      )
      expect(state.statusCode).toBe(401)
      expect(state.headers['WWW-Authenticate']).toBe('Bearer')
      expect(state.json).toEqual({ error: 'unauthorized' })
      expect(loadLatest).not.toHaveBeenCalled()
      expect(saveSnapshot).not.toHaveBeenCalled()
    })

    it.each([
      ['no header', undefined],
      ['a wrong secret', 'Bearer nope'],
      ['a non-bearer scheme', `Basic ${SECRET}`],
    ])('returns 401 for DELETE with %s', async (_, authorization) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(deleteRequest(existing.id, { authorization }), res)
      expect(state.statusCode).toBe(401)
      expect(state.headers['WWW-Authenticate']).toBe('Bearer')
      expect(state.json).toEqual({ error: 'unauthorized' })
      expect(loadLatest).not.toHaveBeenCalled()
      expect(saveSnapshot).not.toHaveBeenCalled()
    })

    it('checks the secret before the id, so a bad id is still a 401', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        putRequest('../etc', undefined, { authorization: undefined }),
        res
      )
      expect(state.statusCode).toBe(401)
    })

    it('returns the same 401 when IDEAS_POST_SECRET is unset', async () => {
      vi.stubEnv('IDEAS_POST_SECRET', '')
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(putRequest(existing.id), res)
      expect(state.statusCode).toBe(401)
    })
  })

  describe('id validation', () => {
    it.each([
      ['an empty id', ''],
      ['a path traversal', '..'],
      ['a dot', `${existing.id}.json`],
      ['a slash', 'a/b'],
      ['an over-long id', 'x'.repeat(65)],
      ['an undefined id', undefined],
      ['a catch-all array', [existing.id]],
    ])('returns 404 for %s without reading the store', async (_, id) => {
      for (const request of [putRequest(id), deleteRequest(id)]) {
        const { res, state } = makeResponse<IdeaByIdResponse>()
        await handleIdeaById(request, res)
        expect(state.statusCode).toBe(404)
        expect(state.json).toEqual({ error: 'not_found' })
      }
      expect(loadLatest).not.toHaveBeenCalled()
      expect(saveSnapshot).not.toHaveBeenCalled()
    })

    it('returns 404 for a well-formed id that does not exist', async () => {
      for (const request of [
        putRequest('20260912T000000000Z-000000'),
        deleteRequest('20260912T000000000Z-000000'),
      ]) {
        const { res, state } = makeResponse<IdeaByIdResponse>()
        await handleIdeaById(request, res)
        expect(state.statusCode).toBe(404)
        expect(state.json).toEqual({ error: 'not_found' })
        expect(state.revalidate).not.toHaveBeenCalled()
      }
      expect(saveSnapshot).not.toHaveBeenCalled()
    })
  })

  describe('If-Match precondition', () => {
    const tag = `"${existing.updatedAt}"`

    it.each([
      ['PUT', () => putRequest(existing.id, undefined, { 'if-match': tag })],
      ['DELETE', () => deleteRequest(existing.id, { 'if-match': tag })],
    ])('%s goes through when the tag matches updatedAt', async (_, make) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()
      await handleIdeaById(make(), res)
      expect(state.statusCode).toBe(200)
      expect(saveSnapshot).toHaveBeenCalledTimes(1)
    })

    it('accepts a weak tag', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()
      await handleIdeaById(
        putRequest(existing.id, undefined, { 'if-match': `W/${tag}` }),
        res
      )
      expect(state.statusCode).toBe(200)
    })

    it.each([
      [
        'PUT',
        () =>
          putRequest(existing.id, undefined, {
            'if-match': '"2026-09-10T00:00:00.000Z"',
          }),
      ],
      [
        'DELETE',
        () =>
          deleteRequest(existing.id, {
            'if-match': '"2026-09-10T00:00:00.000Z"',
          }),
      ],
    ])(
      '%s is refused with 412 when the idea changed since',
      async (_, make) => {
        const { res, state } = makeResponse<IdeaByIdResponse>()
        await handleIdeaById(make(), res)
        expect(state.statusCode).toBe(412)
        expect(state.json).toEqual({ error: 'precondition_failed' })
        expect(loadLatest).toHaveBeenCalledTimes(1)
        expect(saveSnapshot).not.toHaveBeenCalled()
        expect(state.revalidate).not.toHaveBeenCalled()
      }
    )

    it.each([
      ['an unquoted value', existing.updatedAt],
      ['an empty header', ''],
      ['a list of tags', `${tag}, "other"`],
      ['a wildcard', '*'],
    ])('returns 400 for %s without reading the store', async (_, value) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        putRequest(existing.id, undefined, { 'if-match': value }),
        res
      )
      expect(state.statusCode).toBe(400)
      expect(state.json).toEqual({ error: 'invalid_if_match' })
      expect(loadLatest).not.toHaveBeenCalled()
    })

    it('is checked after the id exists, so an unknown id stays 404', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        putRequest('20260912T000000000Z-000000', undefined, {
          'if-match': '"whatever"',
        }),
        res
      )
      expect(state.statusCode).toBe(404)
    })
  })

  describe('PUT validation', () => {
    it('returns 415 for a non-JSON content type', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(
        putRequest(existing.id, 'body=x', { 'content-type': 'text/plain' }),
        res
      )
      expect(state.statusCode).toBe(415)
      expect(loadLatest).not.toHaveBeenCalled()
    })

    it.each([
      ['a missing body', {}],
      ['an empty body', { body: '' }],
      ['a whitespace body', { body: '  \n' }],
      ['a non-string body', { body: 1 }],
      ['a non-object payload', 'edited'],
    ])('returns 400 for %s', async (_, body) => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      await handleIdeaById(putRequest(existing.id, body), res)
      expect(state.statusCode).toBe(400)
      expect(state.json).toEqual({ error: 'body_required' })
      expect(loadLatest).not.toHaveBeenCalled()
    })
  })

  describe('PUT success', () => {
    it('still returns 200 when pruning fails after the update', async () => {
      vi.mocked(pruneSnapshots).mockRejectedValue(new Error('blob exploded'))
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(putRequest(existing.id), res)

      expect(state.statusCode).toBe(200)
      expect(state.json).toEqual({
        id: existing.id,
        updatedAt: NOW.toISOString(),
        revalidated: true,
      })
      expect(state.revalidate).toHaveBeenCalledTimes(2)
      expect(loggedText()).toContain('prune')
      expect(loggedText()).toContain('Error')
      expect(loggedText()).not.toContain('blob exploded')
    })

    it('replaces body and updatedAt only, keeps the rest, and revalidates both pages', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(putRequest(existing.id, { body: 'edited' }), res)

      expect(state.statusCode).toBe(200)
      expect(state.json).toEqual({
        id: existing.id,
        updatedAt: NOW.toISOString(),
        revalidated: true,
      })
      expect(saveSnapshot).toHaveBeenCalledWith(
        [{ ...existing, body: 'edited', updatedAt: NOW.toISOString() }, second],
        NOW
      )
      expect(pruneSnapshots).toHaveBeenCalledTimes(1)
      expect(pruneSnapshots).toHaveBeenCalledWith(NOW)
      expect(
        vi.mocked(pruneSnapshots).mock.invocationCallOrder[0]
      ).toBeGreaterThan(vi.mocked(saveSnapshot).mock.invocationCallOrder[0])
      expect(state.revalidate.mock.calls).toEqual([
        ['/ideas'],
        [`/ideas/${existing.id}`],
      ])
    })

    it.each([
      ['the feed', [new Error('feed down'), undefined]],
      ['the detail page', [undefined, new Error('detail down')]],
    ])(
      'reports revalidated: false when %s fails, after saving',
      async (_, outcomes) => {
        const { res, state } = makeResponse<IdeaByIdResponse>()
        for (const outcome of outcomes) {
          if (outcome === undefined) {
            state.revalidate.mockResolvedValueOnce()
          } else {
            state.revalidate.mockRejectedValueOnce(outcome)
          }
        }

        await handleIdeaById(putRequest(existing.id), res)

        expect(state.statusCode).toBe(200)
        expect(state.json).toMatchObject({ revalidated: false })
        expect(saveSnapshot).toHaveBeenCalledTimes(1)
        expect(state.revalidate).toHaveBeenCalledTimes(2)
        expect(loggedText()).not.toContain('down')
      }
    )
  })

  describe('DELETE success', () => {
    it('removes the idea, saves the rest, and revalidates both pages', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(deleteRequest(existing.id), res)

      expect(state.statusCode).toBe(200)
      expect(state.json).toEqual({ id: existing.id, revalidated: true })
      expect(saveSnapshot).toHaveBeenCalledWith([second], NOW)
      expect(pruneSnapshots).toHaveBeenCalledTimes(1)
      expect(pruneSnapshots).toHaveBeenCalledWith(NOW)
      expect(
        vi.mocked(pruneSnapshots).mock.invocationCallOrder[0]
      ).toBeGreaterThan(vi.mocked(saveSnapshot).mock.invocationCallOrder[0])
      expect(state.revalidate.mock.calls).toEqual([
        ['/ideas'],
        [`/ideas/${existing.id}`],
      ])
    })

    it('still returns 200 when pruning fails after the delete', async () => {
      vi.mocked(pruneSnapshots).mockRejectedValue(new Error('blob exploded'))
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(deleteRequest(existing.id), res)

      expect(state.statusCode).toBe(200)
      expect(state.json).toEqual({ id: existing.id, revalidated: true })
      expect(state.revalidate).toHaveBeenCalledTimes(2)
      expect(loggedText()).toContain('prune')
      expect(loggedText()).toContain('Error')
      expect(loggedText()).not.toContain('blob exploded')
    })

    it('saves an empty snapshot when the last idea is deleted', async () => {
      vi.mocked(loadLatest).mockResolvedValue([existing])
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(deleteRequest(existing.id), res)

      expect(state.statusCode).toBe(200)
      expect(saveSnapshot).toHaveBeenCalledWith([], NOW)
    })

    it('does not require a content type', async () => {
      const { res, state } = makeResponse<IdeaByIdResponse>()
      state.revalidate.mockResolvedValue()

      await handleIdeaById(
        deleteRequest(second.id, { 'content-type': undefined }),
        res
      )

      expect(state.statusCode).toBe(200)
      expect(saveSnapshot).toHaveBeenCalledWith([existing], NOW)
    })

    it.each([
      ['the feed', [new Error('feed down'), undefined]],
      ['the detail page', [undefined, new Error('detail down')]],
    ])(
      'reports revalidated: false when %s fails, after saving',
      async (_, outcomes) => {
        const { res, state } = makeResponse<IdeaByIdResponse>()
        for (const outcome of outcomes) {
          if (outcome === undefined) {
            state.revalidate.mockResolvedValueOnce()
          } else {
            state.revalidate.mockRejectedValueOnce(outcome)
          }
        }

        await handleIdeaById(deleteRequest(existing.id), res)

        expect(state.statusCode).toBe(200)
        expect(state.json).toEqual({ id: existing.id, revalidated: false })
        expect(saveSnapshot).toHaveBeenCalledTimes(1)
        expect(state.revalidate).toHaveBeenCalledTimes(2)
      }
    )
  })

  describe('failure', () => {
    it.each([
      [
        'loading',
        () =>
          vi.mocked(loadLatest).mockRejectedValue(new Error('blob exploded')),
      ],
      [
        'saving',
        () =>
          vi.mocked(saveSnapshot).mockRejectedValue(new Error('blob exploded')),
      ],
    ])('returns 500 without details when %s fails', async (_, arrange) => {
      arrange()
      const { res, state } = makeResponse<IdeaByIdResponse>()

      await handleIdeaById(putRequest(existing.id), res)

      expect(state.statusCode).toBe(500)
      expect(state.json).toEqual({ error: 'internal' })
      expect(state.revalidate).not.toHaveBeenCalled()
      expect(loggedText()).not.toContain('blob exploded')
      expect(loggedText()).not.toContain(SECRET)
    })
  })
})
