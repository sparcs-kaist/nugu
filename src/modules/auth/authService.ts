import { type QueryClient, db, transaction } from '@/db'
import { createAccount, findUserByAccount } from '@/modules/auth/authRepo'
import { type GoogleUserInfo } from '@/modules/auth/google'
import { addEmail, findEmail } from '@/modules/user/emailService'
import { registerUser } from '@/modules/user/userService'

const findUserByGoogleAccount = (googleAccountId: string) =>
  findUserByAccount({
    provider: 'GOOGLE',
    providerAccountId: googleAccountId,
  })

const createGoogleAccount = (
  userId: number,
  googleInfo: GoogleUserInfo,
  client: QueryClient = db,
) =>
  createAccount(
    {
      name: googleInfo.name,
      userId,
      provider: 'GOOGLE',
      providerAccountId: googleInfo.sub,
      email: googleInfo.email,
      avatarURL: googleInfo.picture,
    },
    client,
  )

const registerUserAndCreateGoogleAccount = async (googleInfo: GoogleUserInfo) =>
  transaction(async (client) => {
    const userId = await registerUser(
      {
        lastName: googleInfo.family_name,
        firstName: googleInfo.given_name,
      },
      client,
    )
    await createGoogleAccount(userId, googleInfo, client)
    await addEmail(
      {
        userId,
        email: googleInfo.email,
        primary: true,
        verified: googleInfo.email_verified,
      },
      client,
    )
    return userId
  })

export const getOrRegisterUserByGoogle = async (googleInfo: GoogleUserInfo) => {
  const user = await findUserByGoogleAccount(googleInfo.sub)
  if (user) return user.id

  const existingEmail = await findEmail(googleInfo.email)
  if (existingEmail) {
    const userId = existingEmail.userId
    await createGoogleAccount(userId, googleInfo)
    return userId
  }

  return registerUserAndCreateGoogleAccount(googleInfo)
}
