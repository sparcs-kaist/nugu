import { drizzle } from 'drizzle-orm/mysql2'
import { env } from '@/env'

export const db = drizzle({
  connection: env.DATABASE_URL,
  casing: 'snake_case',
})

export type Database = typeof db
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type QueryClient = Database | Transaction
