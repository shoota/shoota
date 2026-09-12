import { describe, expect, it, vi } from 'vitest'

import {
  FetchLike,
  IdeaTarget,
  MAX_BODY_BYTES,
  NETWORK_ERROR_MESSAGE,
  POST_IDEA_PATH,
  SECRET_STORAGE_KEY,
  SNAPSHOT_PATH,
  StorageLike,
  canSubmit,
  clearSecret,
  deleteIdea,
  fetchIdeas,
  fetchSnapshot,
  ideaApiPath,
  messageForStatus,
  postIdea,
  readSecret,
  requestByteLength,
  snapshotFilename,
  updateIdea,
  writeSecret,
} from '@/lib/ideas/client'
import { Idea } from '@/lib/ideas/types'

/** Bytes the JSON envelope `{"body":""}` adds around the Markdown. */
const ENVELOPE_BYTES = requestByteLength('')

function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  data: Record<string, string>
} {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

function throwingStorage(): StorageLike {
  const fail = () => {
    throw new Error('storage disabled')
  }
  return { getItem: fail, setItem: fail, removeItem: fail }
}

function response(
  status: number,
  body: unknown
): Awaited<ReturnType<FetchLike>> {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(text),
    text: async () => text,
  }
}

function unreadableResponse(): Awaited<ReturnType<FetchLike>> {
  const fail = async () => {
    throw new Error('stream broken')
  }
  return { ok: true, status: 200, json: fail, text: fail }
}

describe('secret storage', () => {
  it('reads a stored secret', () => {
    const storage = memoryStorage({ [SECRET_STORAGE_KEY]: 'abc' })
    expect(readSecret(storage)).toBe('abc')
  })

  it('trims a stored secret', () => {
    const storage = memoryStorage({ [SECRET_STORAGE_KEY]: ' abc\n' })
    expect(readSecret(storage)).toBe('abc')
  })

  it.each([
    ['missing', memoryStorage()],
    ['empty', memoryStorage({ [SECRET_STORAGE_KEY]: '' })],
    ['whitespace only', memoryStorage({ [SECRET_STORAGE_KEY]: '  \n' })],
    ['unavailable', undefined],
    ['throwing', throwingStorage()],
  ])('returns undefined when the secret is %s', (_, storage) => {
    expect(readSecret(storage)).toBeUndefined()
  })

  it('writes the trimmed secret', () => {
    const storage = memoryStorage()
    expect(writeSecret(storage, '  abc \n')).toBe('abc')
    expect(storage.data[SECRET_STORAGE_KEY]).toBe('abc')
  })

  it('treats a blank secret as a clear', () => {
    const storage = memoryStorage({ [SECRET_STORAGE_KEY]: 'abc' })
    expect(writeSecret(storage, '   ')).toBeUndefined()
    expect(storage.data[SECRET_STORAGE_KEY]).toBeUndefined()
  })

  it('clears the secret', () => {
    const storage = memoryStorage({ [SECRET_STORAGE_KEY]: 'abc' })
    clearSecret(storage)
    expect(readSecret(storage)).toBeUndefined()
  })

  it('does not throw when storage is unavailable', () => {
    expect(writeSecret(throwingStorage(), 'abc')).toBeUndefined()
    expect(() => clearSecret(throwingStorage())).not.toThrow()
    expect(() => clearSecret(undefined)).not.toThrow()
  })
})

describe('requestByteLength', () => {
  it('measures the JSON request, not the raw text', () => {
    expect(requestByteLength('')).toBe('{"body":""}'.length)
    expect(requestByteLength('abc')).toBe(ENVELOPE_BYTES + 3)
  })

  it('counts UTF-8 bytes and JSON escapes', () => {
    expect(requestByteLength('あ')).toBe(ENVELOPE_BYTES + 3)
    expect(requestByteLength('a\nb')).toBe(ENVELOPE_BYTES + 4)
    expect(requestByteLength('"')).toBe(ENVELOPE_BYTES + 2)
  })
})

describe('canSubmit', () => {
  const ok = { secret: 's', body: 'hello', busy: false }
  const largest = 'a'.repeat(MAX_BODY_BYTES - ENVELOPE_BYTES)

  it('allows a stored secret with a non-empty body', () => {
    expect(canSubmit(ok)).toBe(true)
  })

  it.each([
    ['no secret', { ...ok, secret: undefined }],
    ['empty secret', { ...ok, secret: '' }],
    ['blank body', { ...ok, body: ' \n' }],
    ['busy', { ...ok, busy: true }],
    ['request one byte over the limit', { ...ok, body: `${largest}a` }],
    [
      'escaped newline pushing over the limit',
      { ...ok, body: `${largest.slice(1)}\n` },
    ],
  ])('refuses with %s', (_, input) => {
    expect(canSubmit(input)).toBe(false)
  })

  it('allows a request exactly at the limit', () => {
    expect(requestByteLength(largest)).toBe(MAX_BODY_BYTES)
    expect(canSubmit({ ...ok, body: largest })).toBe(true)
  })
})

describe('messageForStatus', () => {
  it.each([401, 400, 404, 412, 413, 415, 500])(
    'has a message for %s',
    (status) => {
      expect(messageForStatus(status)).not.toContain('HTTP')
    }
  )

  it('does not describe 500 as a save failure, since GET shares it', () => {
    expect(messageForStatus(500)).not.toContain('保存')
  })

  it('falls back to the status code', () => {
    expect(messageForStatus(502)).toContain('502')
  })
})

describe('postIdea', () => {
  it('sends the body with the bearer secret and returns the result', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(
      response(201, {
        id: 'x',
        createdAt: '2026-09-12T00:00:00.000Z',
        revalidated: true,
      })
    )
    await expect(postIdea('s3cret', '# hi', fetchImpl)).resolves.toEqual({
      ok: true,
      id: 'x',
      createdAt: '2026-09-12T00:00:00.000Z',
      revalidated: true,
    })
    expect(fetchImpl).toHaveBeenCalledWith(POST_IDEA_PATH, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer s3cret',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: '# hi' }),
    })
  })

  it('maps an error status to a message', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(401, { error: 'unauthorized' }))
    await expect(postIdea('s', 'x', fetchImpl)).resolves.toEqual({
      ok: false,
      message: messageForStatus(401),
    })
  })

  it('reports a network failure', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockRejectedValue(new TypeError('offline'))
    await expect(postIdea('s', 'x', fetchImpl)).resolves.toEqual({
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    })
  })

  it('fails when the response body cannot be read', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(unreadableResponse())
    const result = await postIdea('s', 'x', fetchImpl)
    expect(result.ok).toBe(false)
  })

  it.each([
    ['numeric id', { id: 1, createdAt: 'x', revalidated: true }],
    ['missing createdAt', { id: 'x', revalidated: true }],
    ['string revalidated', { id: 'x', createdAt: 'x', revalidated: 'yes' }],
    ['array', []],
    ['null', null],
  ])('rejects an unexpected success payload (%s)', async (_, payload) => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(201, payload))
    const result = await postIdea('s', 'x', fetchImpl)
    expect(result.ok).toBe(false)
  })
})

describe('fetchSnapshot', () => {
  it('returns the raw JSON text and a timestamped filename', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(response(200, '[]'))
    const now = new Date('2026-09-12T01:02:03.456Z')
    await expect(fetchSnapshot('s3cret', fetchImpl, now)).resolves.toEqual({
      ok: true,
      json: '[]',
      filename: 'ideas-20260912T010203456Z.json',
    })
    expect(fetchImpl).toHaveBeenCalledWith(SNAPSHOT_PATH, {
      method: 'GET',
      headers: { Authorization: 'Bearer s3cret' },
    })
  })

  it('maps an error status to a message', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(response(401, {}))
    await expect(fetchSnapshot('s', fetchImpl)).resolves.toEqual({
      ok: false,
      message: messageForStatus(401),
    })
  })

  it('reports a network failure', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockRejectedValue(new TypeError('offline'))
    await expect(fetchSnapshot('s', fetchImpl)).resolves.toEqual({
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    })
  })

  it('fails when the response body cannot be read', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(unreadableResponse())
    const result = await fetchSnapshot('s', fetchImpl)
    expect(result.ok).toBe(false)
  })

  it('produces a filename without characters that need escaping', () => {
    expect(snapshotFilename(new Date('2026-09-12T01:02:03.456Z'))).toMatch(
      /^ideas-\d{8}T\d{9}Z\.json$/
    )
  })
})

describe('ideaApiPath', () => {
  it('nests the id under the post path', () => {
    expect(ideaApiPath('20260912T010203456Z-9f3a1b')).toBe(
      '/api/ideas/20260912T010203456Z-9f3a1b'
    )
  })

  it('escapes an id so it cannot change the path', () => {
    expect(ideaApiPath('a/b?c')).toBe('/api/ideas/a%2Fb%3Fc')
  })
})

const target: IdeaTarget = {
  id: 'x',
  expectedUpdatedAt: '2026-09-11T00:00:00.000Z',
}

describe('updateIdea', () => {
  it('PUTs the same { body } JSON as a post, with the secret and an If-Match tag', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(
      response(200, {
        id: 'x',
        updatedAt: '2026-09-12T00:00:00.000Z',
        revalidated: true,
      })
    )
    await expect(
      updateIdea('s3cret', target, '# hi', fetchImpl)
    ).resolves.toEqual({
      ok: true,
      id: 'x',
      updatedAt: '2026-09-12T00:00:00.000Z',
      revalidated: true,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/ideas/x', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer s3cret',
        'Content-Type': 'application/json',
        'If-Match': '"2026-09-11T00:00:00.000Z"',
      },
      body: JSON.stringify({ body: '# hi' }),
    })
  })

  it.each([
    ['a missing idea', 404],
    ['a stale precondition', 412],
  ])('has a message for %s', async (_, status) => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(response(status, {}))
    const result = await updateIdea('s', target, 'b', fetchImpl)
    expect(result).toEqual({ ok: false, message: messageForStatus(status) })
    expect(messageForStatus(status)).not.toContain('HTTP')
  })

  it('reports a network failure', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockRejectedValue(new Error('down'))
    await expect(updateIdea('s', target, 'b', fetchImpl)).resolves.toEqual({
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    })
  })

  it('fails when the response body cannot be read', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(unreadableResponse())
    const result = await updateIdea('s', target, 'b', fetchImpl)
    expect(result.ok).toBe(false)
  })

  it.each([
    ['numeric id', { id: 1, updatedAt: 'x', revalidated: true }],
    ['missing updatedAt', { id: 'x', revalidated: true }],
    ['string revalidated', { id: 'x', updatedAt: 'x', revalidated: 'yes' }],
    ['array', []],
    ['null', null],
  ])('rejects an unexpected success payload (%s)', async (_, payload) => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, payload))
    const result = await updateIdea('s', target, 'b', fetchImpl)
    expect(result.ok).toBe(false)
  })
})

describe('deleteIdea', () => {
  it('DELETEs with the secret and an If-Match tag, and no body', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, { id: 'x', revalidated: false }))
    await expect(deleteIdea('s3cret', target, fetchImpl)).resolves.toEqual({
      ok: true,
      id: 'x',
      revalidated: false,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/ideas/x', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer s3cret',
        'If-Match': '"2026-09-11T00:00:00.000Z"',
      },
    })
  })

  it.each([401, 404, 412])('maps %s to a message', async (status) => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(response(status, {}))
    await expect(deleteIdea('s', target, fetchImpl)).resolves.toEqual({
      ok: false,
      message: messageForStatus(status),
    })
  })

  it('reports a network failure', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockRejectedValue(new Error('down'))
    const result = await deleteIdea('s', target, fetchImpl)
    expect(result).toEqual({ ok: false, message: NETWORK_ERROR_MESSAGE })
  })

  it('fails when the response body cannot be read', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(unreadableResponse())
    const result = await deleteIdea('s', target, fetchImpl)
    expect(result.ok).toBe(false)
  })

  it.each([
    ['numeric id', { id: 1, revalidated: true }],
    ['missing revalidated', { id: 'x' }],
    ['string revalidated', { id: 'x', revalidated: 'yes' }],
    ['array', []],
    ['null', null],
  ])('rejects an unexpected success payload (%s)', async (_, payload) => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, payload))
    const result = await deleteIdea('s', target, fetchImpl)
    expect(result.ok).toBe(false)
  })
})

describe('fetchIdeas', () => {
  const older: Idea = {
    id: 'older',
    body: 'first',
    createdAt: '2026-09-11T00:00:00.000Z',
    updatedAt: '2026-09-11T00:00:00.000Z',
  }
  const newer: Idea = {
    id: 'newer',
    body: 'second',
    createdAt: '2026-09-12T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z',
  }

  it('loads the snapshot with the secret and orders it newest first', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, [older, newer]))
    await expect(fetchIdeas('s3cret', fetchImpl)).resolves.toEqual({
      ok: true,
      ideas: [newer, older],
    })
    expect(fetchImpl).toHaveBeenCalledWith(SNAPSHOT_PATH, {
      method: 'GET',
      headers: { Authorization: 'Bearer s3cret' },
    })
  })

  it('drops entries that are not ideas', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, [older, { id: 'broken' }, null, 'text']))
    await expect(fetchIdeas('s', fetchImpl)).resolves.toEqual({
      ok: true,
      ideas: [older],
    })
  })

  it('fails when the payload is not an array', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(200, { ideas: [] }))
    const result = await fetchIdeas('s', fetchImpl)
    expect(result.ok).toBe(false)
  })

  it('maps an error status to a message', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockResolvedValue(response(401, {}))
    await expect(fetchIdeas('s', fetchImpl)).resolves.toEqual({
      ok: false,
      message: messageForStatus(401),
    })
  })

  it('reports a network failure', async () => {
    const fetchImpl = vi.fn<FetchLike>().mockRejectedValue(new Error('down'))
    await expect(fetchIdeas('s', fetchImpl)).resolves.toEqual({
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    })
  })
})
