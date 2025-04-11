import { count, eq, like, or, sql } from 'drizzle-orm'
import { type QueryClient, db } from '@/db'
import { type UserInsert, users } from '@/db/schema/user'
import { userRoles } from '@/db/schema/user-role'
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
  const countResult = await client
    .select({ count: count() })
    .from(users)
    .innerJoin(sparcsUsers, eq(users.id, sparcsUsers.userId))
    .where(
      or(
        like(
          sql<string>`LOWER(${sparcsUsers.nickname})`,
          `%${keyword.toLowerCase()}%`,
        ),
        like(
          sql<string>`LOWER(CONCAT(${users.lastName}, ${users.firstName}))`,
          `%${keyword.toLowerCase()}%`,
        ),
      ),
    )
  const totalCount = Number(countResult?.[0]?.count ?? 0)

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
        like(
          sql<string>`LOWER(${sparcsUsers.nickname})`,
          `%${keyword.toLowerCase()}%`,
        ),
        like(
          sql<string>`LOWER(CONCAT(${users.lastName}, ${users.firstName}))`,
          `%${keyword.toLowerCase()}%`,
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
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / size),
    },
  }
}

export const findUserRoles = (userId: number, client: QueryClient = db) =>
  client
    .select({
      role: userRoles.role,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
