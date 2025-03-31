import { and, eq } from 'drizzle-orm'
import { type QueryClient, db } from '@/db/db'
import {
  type AccountInsert,
  type AuthProvider,
  authAccounts,
} from '@/db/schema/auth-acount'
import { users } from '@/db/schema/user'

export const findUserByAccount = async (
  data: {
    provider: AuthProvider
    providerAccountId: string
  },
  client: QueryClient = db,
) => {
  const [res] = await client
    .select({
      user: users,
    })
    .from(authAccounts)
    .innerJoin(users, eq(authAccounts.userId, users.id))
    .where(
      and(
        eq(authAccounts.provider, data.provider),
        eq(authAccounts.providerAccountId, data.providerAccountId),
      ),
    )
  return res?.user ?? null
}

export const createAccount = async (
  account: AccountInsert,
  client: QueryClient = db,
): Promise<void> => {
  await client.insert(authAccounts).values(account)
}
