import { z } from 'zod'

export type Paginated<T> = {
  data: T[]
  pageInfo: {
    page: number // starts from zero
    size: number
    totalElements: number
    totalPages: number
  }
}

export const PaginatedResponseSchema = <T>(schema: z.ZodType<T>) =>
  z.object({
    data: z.array(schema),
    pageInfo: z.object({
      page: z.number(),
      size: z.number(),
      totalElements: z.number(),
      totalPages: z.number(),
    }),
  })
