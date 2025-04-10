import { transaction } from '@/db'
import { createAccount, findUserByAccount } from '@/modules/auth/authRepo'
import { type GoogleUserInfo } from '@/modules/auth/google'
import { getUserRoles, registerUser } from '@/modules/user/userService'

const findUserByGoogleAccount = async (googleAccountId: string) => {
  const user = await findUserByAccount({
    provider: 'GOOGLE',
    providerAccountId: googleAccountId,
  })
  return user?.id ?? null
}

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
  const userId =
    (await findUserByGoogleAccount(googleInfo.sub)) ||
    (await registerUserAndCreateGoogleAccount(googleInfo))
  const userRoles = await getUserRoles(userId)
  return { userId, userRoles }
}
