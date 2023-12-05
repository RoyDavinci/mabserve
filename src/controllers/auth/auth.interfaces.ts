import { type Decimal } from '@prisma/client/runtime/library'

export type KegowUserInterface = {
  phone_number: string
  mifos_client_id: number
  mifos_office_id: number
  mifos_savings_id: number
  mifos_resource_id: number
  gender: string
  first_name: string
  middle_name: string
  last_name: string
  date_of_birth: Date
  address: string
  place_of_birth: string
  photo_url: string
  tier: number
  email: string
  registration_token: string
  device_type: string
  merchant_id: number
  state_of_residence: string
  created_at: Date | null
  last_sms_debit_date: Date | null
  id: number
  account_type: string
  show_balance: number
  send_mail: number
  send_sms: number
  is_sms_cost_taken: number
  unpaid_sms_count: number
  icad_profiled: number
  wallets: [
    {
      id: '757'
      account_no: string
      status_enum: number
      sub_status_enum: number
      account_status: 'normal'
      balance: Decimal
      name: string
    }
  ]
  message: string
  level: string
}

export type GottenUser = {
  id: number
  phone_number: string
  created_at: Date
  mifos_client_id: number
  mifos_office_id: number
  mifos_savings_id: number
  mifos_resource_id: number
  gender: string
  first_name: string
  middle_name: string
  last_name: string
  date_of_birth: Date
  address: string
  place_of_birth: string
  photo_url: string
  tier: number
  email: string
  registration_token: string
  device_type: string
  merchant_id: number
  state_of_residence: string
  account_type: string
  show_balance: number
  send_mail: number
  send_sms: number
  is_sms_cost_taken: number
  unpaid_sms_count: number
  last_sms_debit_date: null
  icad_profiled: number
}

export type USerByPhone = {
  id: number
  phone_number: '08169802421'
  created_at: '2023-08-24T12:31:45.000Z'
  mifos_client_id: 1045
  mifos_office_id: 1
  mifos_savings_id: 763
  mifos_resource_id: 1045
  gender: string
  first_name: string
  last_name: string
  date_of_birth: Date
  address: string
  place_of_birth: string
  photo_url: string
  tier: number
  email: string
  registration_token: string
  device_type: string
  merchant_id: number
  state_of_residence: string
  account_type: string
  show_balance: number
  send_mail: number
  send_sms: number
  is_sms_cost_taken: number
  unpaid_sms_count: number
  last_sms_debit_date: null
  icad_profiled: number
  wallets: [
    {
      id: string
      account_no: string
      status_enum: number
      sub_status_enum: number
      account_status: string
      balance: string
      name: string
    }
  ]
  mifos_client_data: {
    id: number
    accountNo: string
    status: {
      id: number
      code: string
      value: string
    }
    subStatus: {
      active: false
      mandatory: false
    }
    active: true
    activationDate: number[]
    firstname: string
    lastname: string
    displayName: string
    mobileNo: string
    dateOfBirth: number[]
    gender: {
      active: false
      mandatory: false
    }
    clientType: {
      active: false
      mandatory: false
    }
    clientClassification: {
      active: false
      mandatory: false
    }
    isStaff: false
    officeId: number
    officeName: 'Head Office'
    timeline: {
      submittedOnDate: number[]
      submittedByUsername: string
      submittedByFirstname: string
      submittedByLastname: string
      activatedOnDate: [2023, 8, 24]
      activatedByUsername: string
      activatedByFirstname: string
      activatedByLastname: string
    }
    savingsAccountId: number
    groups: []
    clientNonPersonDetails: {
      constitution: {
        active: false
        mandatory: false
      }
      mainBusinessLine: {
        active: false
        mandatory: false
      }
    }
  }
}

export type ErrorPhone = {
  message: {
    statusCode: number
    message: string
    error: string
  }
}

export type Bvn = {
  data: {
    status: string
    message: string
    data: {
      url: string
      reference: string
    }
  }
}
