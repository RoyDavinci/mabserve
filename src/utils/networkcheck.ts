export const networkProductId = (network: string) => {
  if (network.toLocaleLowerCase() === 'mtn') {
    return 'MFIN-5-OR'
  } else if (network.toLocaleLowerCase() === 'glo') {
    return 'MFIN-6-OR '
  } else if (network.toLocaleLowerCase() === 'airtel') {
    return 'MFIN-1-OR'
  }
  return 'MFIN-2-OR'
}
