import { sql } from 'drizzle-orm'
import { datetime, int } from 'drizzle-orm/mysql-core'

export const autoIncrementId = int().autoincrement().primaryKey()

export const timestamps = {
  createdAt: datetime()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}
