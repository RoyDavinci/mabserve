import forge from 'node-forge'

export function encrypt(encryptionKey: string, payload: unknown) {
  const text = JSON.stringify(payload)

  const cipher = forge.cipher.createCipher(
    '3DES-ECB',
    forge.util.createBuffer(encryptionKey)
  )
  cipher.start({ iv: '' })
  cipher.update(forge.util.createBuffer(text, 'utf8'))
  cipher.finish()
  const encrypted = cipher.output
  return forge.util.encode64(encrypted.getBytes())
}
