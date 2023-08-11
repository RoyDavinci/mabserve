export type FlutterWavePaymentIntegration = {
  data: {
    status: string
    message: string
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
}
