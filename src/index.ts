import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { P, match } from 'ts-pattern'
import { UserNotFoundException } from '@/modules/user/userExceptions'
import userRoute from '@/modules/user/userRoute'

const app = new Hono({ strict: false })

app.route('/users', userRoute)

app.onError((err, c) =>
  match(err)
    .with(P.instanceOf(HTTPException), (e) => e.getResponse())
    .with(P.instanceOf(UserNotFoundException), (e) => c.text(e.message, 404))
    .otherwise(() => c.text('Internal Server Error', 500)),
)

serve({
  fetch: app.fetch,
  port: 3000,
})
