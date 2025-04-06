export type Paginated<T> = {
  data: T[]
  pageInfo: {
    page: number // starts from zero
    size: number
    totalElements: number
    totalPages: number
  }
}
