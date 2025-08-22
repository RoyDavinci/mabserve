export type FlutterWavePaymentIntegration = {
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    charged_amount: number
    app_fee: null
    merchant_fee: number
    processor_response: string
    auth_model: string
    currency: string
    ip: string
    narration: string
    status: string
    auth_url: string
    payment_type: string
    fraud_status: string
    created_at: Date
    account_id: number
    customer: {
      id: number
      phone_number: null
      name: string
      email: string
      created_at: Date
    }
    account: {
      account_number: string
      bank_code: string
      account_name: string
    }
    meta: {
      authorization: {
        mode: string
        validate_instructions: string
        redirect: string
      }
    }
  }
}

export type FlutterWaveTransferIntegration = {
  status: string
  message: string
  data: {
    id: number
    account_number: string
    bank_code: string
    full_name: string
    created_at: Date
    currency: string
    amount: number
    fee: number
    status: string
    reference: string
    meta: null
    narration: string
    complete_message: string
    requires_approval: number
    is_approved: number
    bank_name: string
  }
}

export type KeGowTransfer = {
  message: string
  transfer: {
    tx_ref: string
    transfer_amount: string
    sender_wallet_number: number
    receiver_wallet_number: number
    narration: string
    beneficiary_account_name: string
    originator_account_name: string
    beneficiary_account_number: number
    originator_account_number: number
    resquest_id: null
  }
}

export type VerifyAccountNumber = {
  account: {
    bankVerificationNumber: string
    beneficiaryAccountName: string
    beneficiaryAccountNumber: string
    beneficiaryBankCode: string
    beneficiaryNameEnquiryRefrenceNumber: string
    kyclevel: ''
    responseCode: string
    responseMessage: string
    sessionID: string
  }
}

export type KeGowPaymentResponse = {
  message: string
  data: {
    beneficiaryAccountName: string
    beneficiaryAccountNumber: string
    beneficiaryBankCode: string
    narration: string
    amount: number
    beneficiaryNameEnquiryRefrenceNumber: string
    bankVerificationNumber: string
    beneficiaryKYCLevel: ''
    wallet_account_number: string
    channelCode: number
    merchant_id: string
  }
}

export type FlutterWaveCharge = {
  status: string
  message: string
  meta: {
    authorization: {
      transfer_reference: string
      transfer_account: string
      transfer_bank: string
      account_expiration: string
      transfer_note: string
      transfer_amount: number
      mode: string
    }
  }
}

export type flutterWaveCardErrorRespnse = {
  status: string
  message: string
  data: null
  level: string
}

export type FlutterWavePaymentBankCharge = {
  event: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    ip: string
    narration: string
    status: string
    payment_type: string
    created_at: string
    account_id: string
    customer: {
      id: string
      fullname: string
      phone_number: null
      email: string
      created_at: string
    }
    meta: {
      originatoraccountnumber: string
      originatorname: string
      bankname: string
      originatoramount: string
    }
  }
  'event.type': 'BANK_TRANSFER_TRANSACTION'
}

export type FlutterwavePaymentResponse = {
  status: string
  message: string
  data: PaymentData
}

export type PaymentData = {
  id: number
  txRef: string
  orderRef: string
  flwRef: string
  redirectUrl: string
  device_fingerprint: string
  settlement_token: string | null
  cycle: string
  amount: number
  charged_amount: number
  appfee: number
  merchantfee: number
  merchantbearsfee: number
  chargeResponseCode: string
  raveRef: string
  chargeResponseMessage: string
  authModelUsed: string
  currency: string
  IP: string
  narration: string
  status: string
  modalauditid: string
  vbvrespmessage: string
  authurl: string
  vbvrespcode: string
  acctvalrespmsg: string | null
  acctvalrespcode: string | null
  paymentType: string
  paymentPlan: string | null
  paymentPage: string | null
  paymentId: string
  fraud_status: string
  charge_type: string
  is_live: number
  retry_attempt: string | null
  getpaidBatchId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  customerId: number
  AccountId: number
  customer: Customer
  validateInstructions: ValidateInstructions
}

export type Customer = {
  id: number
  phone: string
  fullName: string
  customertoken: string | null
  email: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  AccountId: number
}

export type ValidateInstructions = {
  valparams: any[]
  instruction: string
}

export type ChargeCompleteResponse = {
  status: string
  message: string
  data: ChargeData
}

export type ChargeData = {
  id: number
  txRef: string
  orderRef: string
  flwRef: string
  redirectUrl: string
  device_fingerprint: string
  settlement_token: string | null
  cycle: string
  amount: number
  charged_amount: number
  appfee: number
  merchantfee: number
  merchantbearsfee: number
  chargeResponseCode: string
  raveRef: string
  chargeResponseMessage: string
  authModelUsed: string
  currency: string
  IP: string
  narration: string
  status: string
  modalauditid: string
  vbvrespmessage: string
  authurl: string
  vbvrespcode: string
  acctvalrespmsg: string
  acctvalrespcode: string
  paymentType: string
  paymentPlan: string | null
  paymentPage: string | null
  paymentId: string
  fraud_status: string
  charge_type: string
  is_live: number
  retry_attempt: string | null
  getpaidBatchId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  customerId: number
  AccountId: number
}
export type VirtualAccountResponse = {
  status: string
  message: string
  data: {
    response_code: string
    response_message: string
    flw_ref: string
    order_ref: string
    account_number: string
    frequency: string
    bank_name: string
    created_at: string
    expiry_date: string
    note: string
    amount: number | null
  }
}

export type FlutterwaveChargeResponse = {
  status: string // "success" | "error" etc.
  message: string
  meta: {
    authorization: {
      transfer_reference: string // e.g., "N/A" or actual reference
      transfer_account: string // e.g., "7825397990"
      transfer_bank: string // e.g., "WEMA BANK"
      account_expiration: string // e.g., "N/A"
      transfer_note: string // e.g., "N/A"
      transfer_amount: number // e.g., 1500
      mode: string // e.g., "banktransfer"
    }
  }
}
