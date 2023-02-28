import { obfuscatedClientSecret } from '@cfg/api.config'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

// Just a disguise to obfuscate required tokens (including but not limited to client secret,
// access tokens, and refresh tokens), used along with the following two functions
const AES_SECRET_KEY = 'onedrive-vercel-index'
export function obfuscateToken(token: string): string {
  // Encrypt token with AES
  const encrypted = AES.encrypt(token, AES_SECRET_KEY)
  return encrypted.toString()
}
export function revealObfuscatedToken(obfuscated: string): string {
  // Decrypt SHA256 obfuscated token
  const decrypted = AES.decrypt(obfuscated, AES_SECRET_KEY)
  return decrypted.toString(Utf8)
}

export const clientSecret = revealObfuscatedToken(obfuscatedClientSecret)
