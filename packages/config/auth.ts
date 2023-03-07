/**
 * The password is used to encrypt login info
 * it has to be at least 32 characters long.
 * You can use https://1password.com/password-generator/ to generate strong passwords.
 */
export const privateKey = process.env.OVI_ENCRYPT_KEY ?? ''

/**
 * It's used by server to get access token from access api
 * Make sure you've set it both in main app and configuration app
 */
export const accessKey = process.env.OVI_ACCESS_KEY ?? ''

/**
 * not using auth header for now because SSG doesn't work with it
 */
export const authHeader = 'x-odvi-token'

export const refreshToken = process.env.OVI_REFRESH_TOKEN ?? ''
