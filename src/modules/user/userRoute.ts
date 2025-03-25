import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import * as userService from '@/modules/user/userService'

const app = new Hono().get(
  '/:id',
  zValidator('param', z.object({ id: z.coerce.number() })),
  async (c) => {
    const { id } = c.req.valid('param')

    const user = await userService.getUser(id)

    return c.json(user)
  },
)

export default app
