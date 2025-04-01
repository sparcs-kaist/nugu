import type { QueryClient } from '@/db'
import { UserNotFoundException } from '@/modules/user/userExceptions'
import * as userRepo from '@/modules/user/userRepo'

export const findUser = (id: number) => userRepo.findUser(id)

export const getUser = async (id: number) => {
  const user = await findUser(id)
  if (user === null)
    throw new UserNotFoundException(`User with id ${id} not found`)
  return user
}

export const registerUser = (
  user: {
    lastName: string
    firstName: string
  },
  client: QueryClient,
) => userRepo.createUser(user, client)
