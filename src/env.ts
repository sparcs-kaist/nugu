import { z } from 'zod'

export const env = z
  .object({
    DATABASE_URL: z.string().url(),
    AUTH_GOOGLE_CLIENT_ID: z.string().nonempty(),
    AUTH_GOOGLE_CLIENT_SECRET: z.string().nonempty(),
    AUTH_GOOGLE_REDIRECT_URI: z.string().url(),
    JWT_SECRET: z.string().min(32),
    COOKIE_SECRET: z.string().min(32),
    CORS_ORIGIN: z.string().url(),
    DEFAULT_REDIRECT_URL: z.string().url(),
  })
  .parse(process.env)
