function formatToNigerianNumberSpecific(inputNumber) {
  const digitsOnly = String(inputNumber).replace(/\D/g, '')
  console.log(digitsOnly)

  if (digitsOnly.length === 9) {
    return '080' + digitsOnly.substring(0, 8)
  }
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return digitsOnly
  }
  if (digitsOnly.startsWith('234') && digitsOnly.length === 13) {
    return '0' + digitsOnly.substring(3)
  }
  if (digitsOnly.length === 10) {
    return '0' + digitsOnly
  }
  console.log(digitsOnly)
  return digitsOnly
}

console.log(formatToNigerianNumberSpecific(103276369))
