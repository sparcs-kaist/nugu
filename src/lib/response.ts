import type { Context } from 'hono'

export const response = {
  noContent: (c: Context) => c.body(null, 204),
}
