import { eq } from 'drizzle-orm'
import { type QueryClient, db } from '@/db'
import { type UserInsert, users } from '@/db/schema/user'
import { userRoles } from '@/db/schema/user-role'

export const findUser = async (id: number, client: QueryClient = db) => {
  const [user] = await client.select().from(users).where(eq(users.id, id))
  return user ?? null
}

export const createUser = async (
  user: UserInsert,
  client: QueryClient = db,
) => {
  const [data] = await client.insert(users).values(user).$returningId()
  return data!.id
}

export const findUserRoles = (userId: number, client: QueryClient = db) =>
  client
    .select({
      role: userRoles.role,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
