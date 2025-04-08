import { match } from 'ts-pattern'
import { type QueryClient, db } from '@/db'
import { type Result, result } from '@/lib/result'
import * as emailRepo from '@/modules/user/emailRepo'

export const findEmail = (email: string) => emailRepo.findEmail(email)

type AddEmailOptions = {
  userId: number
  email: string
  verified?: boolean
  primary?: boolean
}

export const addEmail = async (
  options: AddEmailOptions,
  client: QueryClient = db,
): Promise<Result<null, { message: string }>> => {
  const existingEmail = await emailRepo.findEmail(options.email, client)

  if (existingEmail) {
    const message =
      existingEmail.userId === options.userId
        ? `Email ${options.email} is already registered by you`
        : `Email ${options.email} is already registered by another user`

    return result.err({ message })
  }

  try {
    await emailRepo.createEmail(options, client)
    return result.ok(null)
  } catch (error) {
    return match(error)
      .with({ code: 'ER_DUP_ENTRY' }, () =>
        result.err({ message: 'Email is already in use' }),
      )
      .otherwise(() => {
        throw error
      })
  }
}
