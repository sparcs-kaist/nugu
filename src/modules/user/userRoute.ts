import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { authGuard } from '@/modules/auth/authGuard'
import * as userService from '@/modules/user/userService'

const app = new Hono()
  .get('/me', authGuard, async (c) => {
    const userId = c.get('userId')

    const user = await userService.getUser(userId)

    return c.json(user)
  })
  .get(
    '/sparcs',
    zValidator(
      'query',
      z.object({
        q: z.string(),
        page: z
          .string()
          .transform((val) => parseInt(val))
          .pipe(z.number().min(0)),
        size: z
          .string()
          .transform((val) => parseInt(val))
          .pipe(z.number().min(1)),
      }),
    ),
    async (c) => {
      const { q, page, size } = c.req.valid('query')

      const user = await userService.searchSparcsUser(q, page, size)

      return c.json(user)
    },
  )
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    async (c) => {
      const { id } = c.req.valid('param')

      const user = await userService.getUser(id)

      return c.json(user)
    },
  )

export default app
