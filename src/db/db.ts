import { drizzle } from 'drizzle-orm/mysql2'
import { env } from '@/env'

export const db = drizzle({
  connection: env.DATABASE_URL,
  casing: 'snake_case',
})

type Database = typeof db
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type QueryClient = Database | Transaction

type TransactionFunction<T> = (client: QueryClient) => T
export const transaction = <T>(
  inner: TransactionFunction<Promise<T>>,
): Promise<T> => db.transaction(inner)
