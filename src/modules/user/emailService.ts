import { match } from 'ts-pattern'
import { type QueryClient, db, transaction } from '@/db'
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

type SetPrimaryEmailResult = Result<
  null,
  { message: string; code: 'EMAIL_NOT_FOUND' | 'EMAIL_NOT_VERIFIED' }
>

export const setPrimaryEmail = async (
  userId: number,
  emailId: number,
): Promise<SetPrimaryEmailResult> => {
  const email = await emailRepo.findEmailById(emailId)

  if (!email)
    return result.err({ message: 'Email not found', code: 'EMAIL_NOT_FOUND' })

  if (!email.verified)
    return result.err({
      message: 'Email must be verified before setting as primary',
      code: 'EMAIL_NOT_VERIFIED',
    })

  if (!email.primary)
    await transaction(async (client) => {
      await emailRepo.unsetPrimaryEmail(userId, client)
      await emailRepo.setPrimaryEmail(emailId, client)
    })

  return result.ok(null)
}
