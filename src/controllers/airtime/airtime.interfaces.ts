export type RingoAirtimePurchase = {
  message: string
  status: string
  amount: number
  amountCharged: string
  network: string
  msisdn: string
  TransRef: string
}

export type RingoDataPurchase = {
  message: string
  status: string
  package: string
  amountCharged: number
  network: string
  msisdn: string
  TransRef: string
}

export type RingoError = {
  message: ''
  status: ''
}

export type dataBundles = {
  network: 'MTN'
  category: 'Daily'
  price: '100.00'
  allowance: '100MB'
  product_id: 'MT1'
  validity: '1 Day'
}
