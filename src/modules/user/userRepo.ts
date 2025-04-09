import { count, eq, like, or, sql } from 'drizzle-orm'
import { type QueryClient, db } from '@/db'
import { type UserInsert, users } from '@/db/schema/user'
import { sparcsUsers } from '@/db/schema/user-sparcs'
import type { Paginated } from '@/lib/pagination'

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

export const searchSparcsUser = async (
  keyword: string,
  page: number,
  size: number,
  client: QueryClient = db,
): Promise<
  Paginated<{
    id: number
    nickname: string
    fullName: string
  }>
> => {
  const totalData = await client
    .select({ count: count() })
    .from(users)
    .innerJoin(sparcsUsers, eq(users.id, sparcsUsers.userId))

  const data = await client
    .select({
      id: users.id,
      nickname: sparcsUsers.nickname,
      fullName: sql<string>`CONCAT(${users.lastName}, ${users.firstName})`,
      // TODO: users.phoneNumber
      // TODO: users.email
      // TODO: sparcsUsers.joinedDate
    })
    .from(users)
    .innerJoin(sparcsUsers, eq(users.id, sparcsUsers.userId))
    .where(
      or(
        like(sparcsUsers.nickname, `%${keyword}%`),
        like(
          sql<string>`CONCAT(${users.lastName}, ${users.firstName})`,
          `%${keyword}%`,
        ),
      ),
    )
    .limit(size)
    .offset(page * size)

  return {
    data,
    pageInfo: {
      page,
      size,
      totalElements: totalData.length,
      totalPages: Math.ceil(totalData.length / size),
    },
  }
}
