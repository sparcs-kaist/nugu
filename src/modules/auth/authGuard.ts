import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { cookie } from '@/lib/cookie'
import { getUnixTimeInSeconds } from '@/lib/date'
import { jwt } from '@/lib/jwt'
import { type Role, roles } from '@/lib/role'

type AllowedRole = Role | 'AUTHENTICATED'

type TVariables = { userId: number }

const createAuthGuard = (allowedRoles: AllowedRole[]) =>
  createMiddleware<{ Variables: TVariables }>(async (c, next) => {
    const res = await cookie.get(c, 'authToken')

    if (!res.ok || res.data === undefined)
      throw new HTTPException(401, { message: 'Unauthorized' })

    const token = res.data
    const payload = await jwt.verify('authToken', token)

    if (
      !allowedRoles.includes('AUTHENTICATED') &&
      !payload.roles.some((role) => allowedRoles.includes(role))
    )
      throw new HTTPException(403, { message: 'Forbidden' })

    c.set('userId', payload.sub)
    await next()
  })

export const authGuard = createAuthGuard(['AUTHENTICATED', ...roles])
export const authSparcsGuard = createAuthGuard(['SPARCS'])

type AuthTokenPayload = { sub: number; roles: Role[] }

export const signAuthToken = (payload: AuthTokenPayload) => {
  const iat = getUnixTimeInSeconds()
  return jwt.sign<'authToken'>({ iat, ...payload })
}

export const setAuthToken = async (c: Context, token: string) => {
  await cookie.set(c, 'authToken', token, { maxAge: 3600 })
}

export const removeAuthToken = (c: Context) => {
  cookie.delete(c, 'authToken')
}
