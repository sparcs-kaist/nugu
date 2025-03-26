import type { Context } from 'hono'
import {
  deleteCookie as _deleteCookie,
  getSignedCookie,
  setSignedCookie,
} from 'hono/cookie'
import type { CookieOptions } from 'hono/utils/cookie'
import { z } from 'zod'
import { env } from '@/env'

const cookieSchema = z.object({
  authToken: z.string(),
})
type Cookie = z.infer<typeof cookieSchema>
type CookieKey = keyof Cookie

const defaultSetOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  prefix: 'secure',
} as const satisfies CookieOptions
type SetCookieOptions = Omit<CookieOptions, keyof typeof defaultSetOptions>

const getCookie = async <TKey extends CookieKey>(
  c: Context,
  key: TKey,
): Promise<{ ok: true; data: Cookie[TKey] | undefined } | { ok: false }> => {
  const value = await getSignedCookie(c, env.COOKIE_SECRET, key, 'secure')

  if (value === false) return { ok: false }
  if (value === undefined) return { ok: true, data: undefined }
  return { ok: true, data: cookieSchema.shape[key].parse(JSON.parse(value)) }
}

const setCookie = <TKey extends CookieKey>(
  c: Context,
  key: TKey,
  value: Cookie[TKey],
  options?: SetCookieOptions,
): Promise<void> =>
  setSignedCookie(c, key, JSON.stringify(value), env.COOKIE_SECRET, {
    ...defaultSetOptions,
    ...options,
  })

const deleteCookie = <TKey extends CookieKey>(c: Context, key: TKey): void => {
  _deleteCookie(c, key, { prefix: 'secure' })
}

export const cookie = {
  get: getCookie,
  set: setCookie,
  delete: deleteCookie,
}
