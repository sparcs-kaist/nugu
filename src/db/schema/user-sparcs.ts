import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { autoIncrementId, timestamps } from '@/db/fields'
import { users } from '@/db/schema/user'

export const sparcsUsers = mysqlTable('user_sparcs', {
  id: autoIncrementId,
  userId: int()
    .notNull()
    .references(() => users.id),
  nickname: varchar({ length: 20 }).notNull().unique(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
})
