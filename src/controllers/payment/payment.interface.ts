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
