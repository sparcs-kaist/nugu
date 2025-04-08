import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { authGuard } from '@/modules/auth/authGuard'
import * as emailService from '@/modules/user/emailService'
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
      if (!res.ok) return c.json(res.error, 409)

      return c.text('Email added successfully', 201)
    },
  )

export default app
