import { createHash, createCipheriv } from 'crypto'

function getEncryptionKey(seckey: string) {
  const md5 = createHash('md5').update(seckey).digest('hex')
  const last12 = md5.substr(-12)
  const first12 = seckey.replace('FLWSECK-', '').substr(0, 12)
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return first12 + last12
}

function encrypt(key: string, text: string) {
  const cipher = createCipheriv('des-ede3', key, '')
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

export default { getEncryptionKey, encrypt }
