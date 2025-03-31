import { transaction } from '@/db'
import { createAccount, findUserByAccount } from '@/modules/auth/authRepo'
import { type GoogleUserInfo } from '@/modules/auth/google'
import { registerUser } from '@/modules/user/userService'

const findUserByGoogleAccount = (googleAccountId: string) =>
  findUserByAccount({
    provider: 'GOOGLE',
    providerAccountId: googleAccountId,
  })

const registerUserAndCreateGoogleAccount = async (googleInfo: GoogleUserInfo) =>
  transaction(async (client) => {
    const userId = await registerUser(
      {
        lastName: googleInfo.family_name,
        firstName: googleInfo.given_name,
      },
      client,
    )
    await createAccount(
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
    return userId
  })

export const getOrRegisterUserByGoogle = async (googleInfo: GoogleUserInfo) => {
  const user = await findUserByGoogleAccount(googleInfo.sub)
  if (user !== null) return user.id
  return registerUserAndCreateGoogleAccount(googleInfo)
}
