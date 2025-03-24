import { eq } from 'drizzle-orm'
import { db } from '@/db/db'
import { type User, type UserInsert, users } from '@/db/schema/user'

export const findUser = async (id: number): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.id, id))
  return user ?? null
}

export const createUser = async (user: UserInsert): Promise<number> => {
  const [data] = await db.insert(users).values(user).$returningId()
  return data!.id
}
