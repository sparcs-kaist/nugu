import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { userInsertSchema } from '@/db/schema/user'
import * as userService from '@/modules/user/userService'

const app = new Hono()
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    async (c) => {
      const { id } = c.req.valid('param')

      const user = await userService.getUser(id)

      return c.json(user)
    },
  )
  .post('/', zValidator('json', userInsertSchema), async (c) => {
    const userData = c.req.valid('json')

    const id = await userService.registerUser(userData)
    const user = await userService.getUser(id)

    return c.json(user, 201)
  })

export default app
