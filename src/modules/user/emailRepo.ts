import { and, eq } from 'drizzle-orm'
import { type QueryClient, db } from '@/db'
import { type EmailInsert, emails } from '@/db/schema/email'

export const findEmailById = async (id: number, client: QueryClient = db) => {
  const [row] = await client.select().from(emails).where(eq(emails.id, id))
  return row ?? null
}

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

export const setEmailVerified = async (
  emailId: number,
  client: QueryClient = db,
) => {
  await client
    .update(emails)
    .set({ verified: true })
    .where(eq(emails.id, emailId))
}

export const setPrimaryEmail = async (
  emailId: number,
  client: QueryClient = db,
) => {
  await client
    .update(emails)
    .set({ primary: true })
    .where(eq(emails.id, emailId))
}

export const unsetPrimaryEmail = async (
  userId: number,
  client: QueryClient = db,
) => {
  await client
    .update(emails)
    .set({ primary: false })
    .where(and(eq(emails.userId, userId), eq(emails.primary, true)))
}
