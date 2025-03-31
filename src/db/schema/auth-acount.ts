import {
  index,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/mysql-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { timestamps } from '@/db/fields'
import { users } from '@/db/schema/user'

const authProviders = ['GOOGLE'] as const

export const authAccounts = mysqlTable(
  'auth_account',
  {
    userId: int()
      .notNull()
      .references(() => users.id),
    provider: varchar({ length: 20, enum: authProviders }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    avatarURL: varchar({ length: 255 }).notNull(),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index('idx_auth_account_01').on(table.email),
  ],
)

const accountSchema = createSelectSchema(authAccounts)
const accountInsertSchema = createInsertSchema(authAccounts)

type Account = z.infer<typeof accountSchema>
export type AccountInsert = z.infer<typeof accountInsertSchema>

export type AuthProvider = Account['provider']
