import { describe, expect, it, vi } from 'vitest'

import {
  FetchLike,
  MAX_BODY_BYTES,
  NETWORK_ERROR_MESSAGE,
  POST_IDEA_PATH,
  SECRET_STORAGE_KEY,
  SNAPSHOT_PATH,
  StorageLike,
  bodyByteLength,
  canSubmit,
  clearSecret,
  fetchSnapshot,
  messageForStatus,
  postIdea,
  readSecret,
  snapshotFilename,
  writeSecret,
} from '@/lib/ideas/client'

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

describe('secret storage', () => {
  it('reads a stored secret', () => {
    const storage = memoryStorage({ [SECRET_STORAGE_KEY]: 'abc' })
    expect(readSecret(storage)).toBe('abc')
  })

  it.each([
    ['missing', memoryStorage()],
    ['empty', memoryStorage({ [SECRET_STORAGE_KEY]: '' })],
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

describe('bodyByteLength', () => {
  it('counts UTF-8 bytes', () => {
    expect(bodyByteLength('')).toBe(0)
    expect(bodyByteLength('abc')).toBe(3)
    expect(bodyByteLength('あ')).toBe(3)
  })
})

describe('canSubmit', () => {
  const ok = { secret: 's', body: 'hello', busy: false }

  it('allows a stored secret with a non-empty body', () => {
    expect(canSubmit(ok)).toBe(true)
  })

  it.each([
    ['no secret', { ...ok, secret: undefined }],
    ['empty secret', { ...ok, secret: '' }],
    ['blank body', { ...ok, body: ' \n' }],
    ['busy', { ...ok, busy: true }],
    ['body over the limit', { ...ok, body: 'a'.repeat(MAX_BODY_BYTES + 1) }],
  ])('refuses with %s', (_, input) => {
    expect(canSubmit(input)).toBe(false)
  })

  it('allows a body exactly at the limit', () => {
    expect(canSubmit({ ...ok, body: 'a'.repeat(MAX_BODY_BYTES) })).toBe(true)
  })
})

describe('messageForStatus', () => {
  it.each([401, 400, 413, 415, 500])('has a message for %s', (status) => {
    expect(messageForStatus(status)).not.toContain('HTTP')
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

  it('rejects an unexpected success payload', async () => {
    const fetchImpl = vi
      .fn<FetchLike>()
      .mockResolvedValue(response(201, { id: 1 }))
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

  it('produces a filename without characters that need escaping', () => {
    expect(snapshotFilename(new Date('2026-09-12T01:02:03.456Z'))).toMatch(
      /^ideas-\d{8}T\d{9}Z\.json$/
    )
  })
})
