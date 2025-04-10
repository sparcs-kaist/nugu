export const roles = ['SPARCS', 'WHEEL', 'DIRECTOR'] as const
export type Role = (typeof roles)[number]
