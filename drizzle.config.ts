import { defineConfig } from 'drizzle-kit'
import { env } from '@/env'

export default defineConfig({
  dialect: 'mysql',
  out: './src/db/migration',
  schema: './src/db/schema',
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
