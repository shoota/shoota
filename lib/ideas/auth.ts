import { timingSafeEqual } from 'crypto'

const BEARER = /^Bearer\s+(\S+)$/i

/**
 * Checks an `Authorization: Bearer <token>` header against the shared secret.
 * Fails closed when the secret is not configured, so environments without
 * `IDEAS_POST_SECRET` (Preview, local without env) never accept writes.
 * The comparison is constant-time once the lengths match; a length mismatch
 * is rejected outright because `timingSafeEqual` throws on unequal buffers.
 */
export function isAuthorized(
  authorization: string | string[] | undefined,
  secret: string | undefined
): boolean {
  if (!secret) {
    return false
  }
  if (typeof authorization !== 'string') {
    return false
  }
  const match = BEARER.exec(authorization.trim())
  if (!match) {
    return false
  }
  const presented = Buffer.from(match[1], 'utf8')
  const expected = Buffer.from(secret, 'utf8')
  if (presented.length !== expected.length) {
    return false
  }
  return timingSafeEqual(presented, expected)
}
