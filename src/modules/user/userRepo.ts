import { eq } from 'drizzle-orm'
import { type QueryClient, db } from '@/db/db'
import { type User, type UserInsert, users } from '@/db/schema/user'

export const findUser = async (
  id: number,
  client: QueryClient = db,
): Promise<User | null> => {
  const [user] = await client.select().from(users).where(eq(users.id, id))
  return user ?? null
}

export const createUser = async (
  user: UserInsert,
  client: QueryClient = db,
): Promise<number> => {
  const [data] = await client.insert(users).values(user).$returningId()
  return data!.id
}
