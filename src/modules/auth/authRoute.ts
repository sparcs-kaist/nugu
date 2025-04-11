import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { env } from '@/env'
import {
  removeAuthToken,
  setAuthToken,
  signAuthToken,
} from '@/modules/auth/authGuard'
import * as authService from '@/modules/auth/authService'
import { google } from '@/modules/auth/google'

// TODO: Use key-value store for distributed system (e.g., Redis)
/**
 * Stores state and redirect URL (where the user should be redirected after login)
 */
const states = new Map<string, string>()

const app = new Hono()
  .get('/signout', (c) => {
    removeAuthToken(c)
    return c.redirect(env.DEFAULT_REDIRECT_URL)
  })
  .get('/google', (c) => {
    const from = c.req.query('from')
    const state = uuidv4()
    states.set(state, from ?? env.DEFAULT_REDIRECT_URL)
    const url = google.getRedirectURL(state)
    return c.redirect(url)
  })
  .get(
    '/google/callback',
    zValidator(
      'query',
      z.object({
        state: z.string(),
        code: z.string(),
      }),
    ),
    async (c) => {
      const { code, state } = c.req.valid('query')

      const redirectURL = states.get(state)
      if (redirectURL === undefined)
        throw new HTTPException(400, { message: 'Invalid state' })
      states.delete(state)

      const { access_token } = await google.issueToken(code)
      const googleInfo = await google.getUserInfo(access_token)

      const userId = await authService.getOrRegisterUserByGoogle(googleInfo)
      const userRoles = await authService.getUserRoles(userId)

      const authToken = await signAuthToken({ sub: userId, roles: userRoles })
      await setAuthToken(c, authToken)

      return c.redirect(redirectURL)
    },
  )

export default app
