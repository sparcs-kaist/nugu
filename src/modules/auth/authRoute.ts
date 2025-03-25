import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { env } from '@/env'
import { google } from '@/modules/auth/google'

// TODO: Use key-value store for distributed system (e.g., Redis)
/**
 * Stores state and redirect URL (where the user should be redirected after login)
 */
const states = new Map<string, string>()

const app = new Hono()
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
      const user = await google.getUserInfo(access_token)

      // TODO: Save to database if user does not exist
      console.log(user)

      // TODO: Issue JWT token

      return c.redirect(redirectURL)
    },
  )

export default app
