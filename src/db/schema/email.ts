import { boolean, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { autoIncrementId, timestamps } from '@/db/fields'
import { users } from '@/db/schema/user'

export const emails = mysqlTable('email', {
  id: autoIncrementId,
  userId: int()
    .notNull()
    .references(() => users.id),
  email: varchar({ length: 255 }).notNull().unique(),
  verified: boolean().notNull().default(false),
  primary: boolean().notNull().default(false),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
})

const emailInsertSchema = createInsertSchema(emails)

export type EmailInsert = z.infer<typeof emailInsertSchema>
