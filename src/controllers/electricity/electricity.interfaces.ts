export type RingoElectricityValidate = {
  meterNo: string
  customerName: string
  customerAddress: string
  customerDistrict: null | string
  phoneNumber: null | string
  type: string
  disco: string
  status: string
}

export type RingoElectricityPurchase = {
  token: string
  unit: string
  amount: string
  amountCharged: string
  message: string
  status: string
  customerName: string
  date: Date
  TransRef: string
  disco: string
  resetToken: string
  configureToken: string
}
