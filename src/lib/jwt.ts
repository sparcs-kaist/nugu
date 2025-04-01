import { sign, verify } from 'hono/jwt'
import { z } from 'zod'
import { env } from '@/env'

const JWT_ALGORITHM = 'HS256'

const tokenSchema = z.object({
  authToken: z.object({
    sub: z.number(),
    iat: z.number(),
  }),
})
type Token = z.infer<typeof tokenSchema>
type TokenKey = keyof Token

const signToken = <TKey extends TokenKey>(payload: Token[TKey]) =>
  sign(payload, env.JWT_SECRET, JWT_ALGORITHM)

const verifyToken = async <TKey extends TokenKey>(
  key: TKey,
  token: string,
): Promise<Token[TKey]> => {
  const payload = await verify(token, env.JWT_SECRET, JWT_ALGORITHM)
  return tokenSchema.shape[key].parse(payload)
}

export const jwt = { sign: signToken, verify: verifyToken }
