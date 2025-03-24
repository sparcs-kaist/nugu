import type { User } from '@/db/schema/user'
import { UserNotFoundException } from '@/modules/user/userExceptions'
import * as userRepo from '@/modules/user/userRepo'

export const findUser = (id: number): Promise<User | null> =>
  userRepo.findUser(id)

export const getUser = async (id: number): Promise<User> => {
  const user = await findUser(id)
  if (user === null)
    throw new UserNotFoundException(`User with id ${id} not found`)
  return user
}

export const registerUser = (user: {
  lastName: string
  firstName: string
}): Promise<number> => userRepo.createUser(user)
