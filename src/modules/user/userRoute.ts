import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { response } from '@/lib/response'
import { authGuard } from '@/modules/auth/authGuard'
import * as emailService from '@/modules/user/emailService'
import { setPrimaryEmail } from '@/modules/user/emailService'
import * as userService from '@/modules/user/userService'

const app = new Hono()
  .get('/me', authGuard, async (c) => {
    const userId = c.get('userId')

    const user = await userService.getUser(userId)

    return c.json(user)
  })
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    async (c) => {
      const { id } = c.req.valid('param')

      const user = await userService.getUser(id)

      return c.json(user)
    },
  )
  .post(
    '/:id/emails',
    zValidator('param', z.object({ id: z.coerce.number() })),
    zValidator('json', z.object({ email: z.string().email() })),
    authGuard,
    async (c) => {
      const requesterId = c.get('userId')
      const { id: userId } = c.req.valid('param')
      const { email } = c.req.valid('json')

      // TODO: Use better authorization mechanism
      if (requesterId !== userId)
        throw new HTTPException(403, {
          message: 'You are not allowed to add email for this user',
        })

      const res = await emailService.addEmail({ userId, email })
      if (res.ok) return c.text('Email added successfully', 201)

      throw new HTTPException(409, { message: res.error.message })
    },
  )
  .put(
    '/:id/emails/:emailId/primary',
    zValidator(
      'param',
      z.object({
        id: z.coerce.number(),
        emailId: z.coerce.number(),
      }),
    ),
    authGuard,
    async (c) => {
      const requesterId = c.get('userId')
      const { id: userId, emailId } = c.req.valid('param')

      // TODO: Use better authorization mechanism
      if (requesterId !== userId)
        throw new HTTPException(403, {
          message: 'You are not allowed to set primary email for this user',
        })

      const res = await setPrimaryEmail(userId, emailId)
      if (res.ok) return response.noContent(c)

      return match(res.error)
        .with({ code: 'EMAIL_NOT_FOUND' }, ({ message }) => {
          throw new HTTPException(404, { message })
        })
        .with({ code: 'EMAIL_NOT_VERIFIED' }, ({ message }) => {
          throw new HTTPException(400, { message })
        })
        .exhaustive()
    },
  )

export default app
