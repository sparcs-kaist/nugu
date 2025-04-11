import {
  index,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/mysql-core'
import { timestamps } from '@/db/fields'
import { users } from '@/db/schema/user'
import { roles } from '@/lib/role'

export const userRoles = mysqlTable(
  'user_role',
  {
    userId: int()
      .notNull()
      .references(() => users.id),
    role: varchar({ length: 20, enum: roles }).notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.role] }),
    index('idx_user_role_01').on(table.userId),
  ],
)
