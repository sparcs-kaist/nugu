import { eq } from 'drizzle-orm'
import { type QueryClient, db } from '@/db'
import { type EmailInsert, emails } from '@/db/schema/email'

export const findEmail = async (email: string, client: QueryClient = db) => {
  const [row] = await client
    .select()
    .from(emails)
    .where(eq(emails.email, email))
  return row ?? null
}

export const createEmail = async (
  options: EmailInsert,
  client: QueryClient = db,
) => {
  const [data] = await client.insert(emails).values(options).$returningId()
  return data!.id
}
