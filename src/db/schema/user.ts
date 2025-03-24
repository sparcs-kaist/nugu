import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { autoIncrementId, timestamps } from '@/db/fields'

export const users = mysqlTable('user', {
  id: autoIncrementId,
  lastName: varchar({ length: 50 }).notNull(),
  firstName: varchar({ length: 50 }).notNull(),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
})

const userSchema = createSelectSchema(users)
export const userInsertSchema = createInsertSchema(users)

export type User = z.infer<typeof userSchema>
export type UserInsert = z.infer<typeof userInsertSchema>
