import ky from 'ky'
import { env } from '@/env'

const getRedirectURL = (state: string): string => {
  const searchParams = new URLSearchParams({
    client_id: env.AUTH_GOOGLE_CLIENT_ID,
    redirect_uri: env.AUTH_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${searchParams}`
}

type GoogleIssuedToken = {
  access_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
  id_token: string
}

const issueToken = async (code: string): Promise<GoogleIssuedToken> =>
  ky
    .post<GoogleIssuedToken>(`https://oauth2.googleapis.com/token`, {
      searchParams: {
        client_id: env.AUTH_GOOGLE_CLIENT_ID,
        client_secret: env.AUTH_GOOGLE_CLIENT_SECRET,
        redirect_uri: env.AUTH_GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      },
    })
    .json()

type GoogleUserInfo = {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
}

const getUserInfo = (accessToken: string): Promise<GoogleUserInfo> =>
  ky
    .get<GoogleUserInfo>('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json()

export const google = {
  getRedirectURL,
  issueToken,
  getUserInfo,
}
