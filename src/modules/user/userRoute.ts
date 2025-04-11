import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { paginatedResponseSchema } from '@/lib/pagination'
import { authGuard, authSparcsGuard } from '@/modules/auth/authGuard'
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
        q: z.string().nonempty('검색어는 필수입니다.'),
        page: z.coerce.number().default(0),
        size: z.coerce.number().default(20),
      }),
    ),
    authSparcsGuard,
    async (c) => {
      const { q, page, size } = c.req.valid('query')

      const sparcsUsers = await userService.searchSparcsUser(q, page, size)

      const validatedUsers = paginatedResponseSchema(
        z.object({
          id: z.number(),
          nickname: z.string(),
          fullName: z.string(),
        }),
      ).parse(sparcsUsers)

      return c.json(validatedUsers)
    },
  )
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    authSparcsGuard,
    async (c) => {
      const { id } = c.req.valid('param')

      const user = await userService.getUser(id)

      return c.json(user)
    },
  )

export default app
