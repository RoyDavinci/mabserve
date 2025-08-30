import { Request, Response } from 'express'
import logger from '../../common/logger'
import prisma from '../../db/prisma'
import axios, { AxiosResponse } from 'axios'
import config from '../../config'
import { UserController } from '../../helpers/UserController'
import { creditUser, debitUser } from './WalletController.'

export const createVirtualAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  logger.info('[createVirtualAccount] Function entry', {
    userId: req.user?.id,
    ip: req.ip
  })

  try {
    if (!req.user || !req.user.id) {
      logger.warn(
        '[createVirtualAccount] User not authenticated or user ID missing from request.',
        { user: req.user }
      )
      return res.status(401).json({
        message: 'Authentication required. Please log in.',
        status: false
      })
    }

    const userId = req.user.id
    logger.info('[createVirtualAccount] Attempting to fetch user from DB', {
      userId
    })
    const fetchUser = await prisma.users.findUnique({ where: { id: userId } })

    if (!fetchUser) {
      logger.warn('[createVirtualAccount] User not found in DB', { userId })
      return res
        .status(404)
        .json({ message: 'User not found. Kindly login again.', status: false })
    }
    logger.info('[createVirtualAccount] User fetched successfully', {
      userId: fetchUser.id,
      email: fetchUser.email
    })

    logger.info(
      '[createVirtualAccount] Attempting to fetch wallet code for user',
      { userId }
    )
    const getWalletCode = await prisma.wallet.findUnique({
      where: { user_id: userId }
    })

    if (!getWalletCode) {
      logger.warn('[createVirtualAccount] Wallet code not found for user', {
        userId
      })
      return res.status(404).json({
        message: 'Wallet details not found. Kindly login again.',
        status: false
      })
    }
    logger.info('[createVirtualAccount] Wallet code fetched successfully', {
      userId,
      walletCode: getWalletCode.wallet_id
    })

    try {
      const phone = formatToNigerianNumberSpecific(
        getWalletCode.wallet_id.toString()
      )
      logger.info(
        '[createVirtualAccount] Formatted phone number for Pinspay API',
        {
          originalCode: getWalletCode.wallet_id,
          formattedPhone: phone
        }
      )

      const pinspayPayload = {
        phone_number: phone,
        firstname: 'Blegh' + 'D',
        lastname: 'Blessing' + 'DD',
        email: fetchUser.email
      }
      logger.info('[createVirtualAccount] Sending request to Pinspay API', {
        pinspayPayload
      })
      logger.info('[createVirtualAccount] Received response from Pinspay API', {
        userId,

        data: { url: config.pinspayUrl, token: config.pinspayToken }
      })

      const { data } = await axios.post(
        `https://pinspay.com/api/generateLinkedAccount`,
        pinspayPayload,
        {
          headers: { apikey: config.pinspayToken }
        }
      )
      const response = data

      logger.info('[createVirtualAccount] Received response from Pinspay API', {
        userId,
        response,
        data: {
          url: config.pinspayUrl,
          token: config.pinspayToken,
          data: response
        }
      })

      if (
        response.status === '200' &&
        response.message?.toLowerCase() === 'successful'
      ) {
        logger.info(
          '[createVirtualAccount] Pinspay API call successful. Updating user with account number.',
          { userId, pinspayAccount: response.account }
        )
        await prisma.virtualAccount.create({
          data: {
            accountNumber: response.account,
            userId: req.user.id,
            bankName: 'TAJ_PinsPay'
          }
        })
        logger.info(
          '[createVirtualAccount] User updated with Pinspay account number.',
          { userId }
        )
        return res.status(200).json({
          message: 'Virtual account created successfully',
          account: response.account,
          status: true
        })
      } else {
        const pinspayErrorMessage =
          response.message || 'Pinspay account generation failed.'
        logger.error(
          '[createVirtualAccount] Pinspay API call indicated failure',
          {
            userId,
            responseStatus: response.status,
            responseMessage: response.message
          }
        )
        return res
          .status(500)
          .json({ message: pinspayErrorMessage, status: false })
      }
    } catch (axiosError: any) {
      const clientErrorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to connect to virtual account service.'
      logger.error('[createVirtualAccount] Error during Pinspay API call', {
        userId,
        error: axiosError.message,
        axiosResponseData: axiosError.response?.data
      })
      return res.status(400).json({
        message: `Virtual account creation failed: ${clientErrorMessage}`,
        status: false
      })
    }
  } catch (error: any) {
    const clientErrorMessage =
      error.message ||
      'An unexpected error occurred during virtual account creation.'
    logger.error(
      '[createVirtualAccount] Unhandled error in main try-catch block',
      {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        fullError: error
      }
    )
    return res.status(500).json({ message: clientErrorMessage, status: false })
  }
}

function formatToNigerianNumberSpecific(inputNumber: string | number): string {
  const digitsOnly = String(inputNumber).replace(/\D/g, '')

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
  return digitsOnly
}

// Define the structure of the incoming webhook payload from Pinspay
export interface PinspayWebhookPayload {
  request_id: string
  virtual_account: string // This is the account number funded
  amount_funded: number
  // Add any other fields you expect from the webhook
  [key: string]: any // Allow for other unknown properties
}

// Define the structure of the successful response from Pinspay's virtual funding query API
export interface PinspayQuerySuccessData {
  requestID: string
  status: string // e.g., "SUCCESS", "PENDING", "FAILED"
  amount: number
  // Add other relevant data fields from Pinspay's query response
  [key: string]: any
}

export interface PinspayQuerySuccessResponse {
  status: string // "200" for success in Pinspay's context
  message: string
  data: PinspayQuerySuccessData
}

// Define the structure for an error response from Pinspay's virtual funding query API
export interface PinspayQueryErrorResponse {
  status: string // e.g., "400", "500"
  message: string
  // Add other relevant error fields
  [key: string]: any
}

// Combined type for Pinspay Query Response
export type PinspayQueryResponse =
  | PinspayQuerySuccessResponse
  | PinspayQueryErrorResponse

// Define the structure for your User model (based on your context)
// Adjust fields as per your actual Prisma schema for the User model
export interface User {
  id: string // Assuming string UUID or similar
  email: string
  full_name: string // Or first_name, last_name
  pinspayAccountNumber?: string | null // Corresponds to rolez_account
  // Add other user fields as needed
  [key: string]: any
}

// Define the structure for your Wallet model (based on your context)
// Adjust fields as per your actual Prisma schema for the Wallet model
export interface Wallet {
  id: string // Assuming string UUID or similar
  userId: string
  balance: number
  // Add other wallet fields as needed
  [key: string]: any
}

// Define the structure for your Wallet_history model (from your Prisma schema)
// This interface directly maps to your Prisma `wallet_histories` model
export interface WalletHistory {
  id: bigint
  amount: number
  userId: bigint
  source?: string | null
  channel?: string | null
  status: string
  balanceAfter?: number | null
  createdAt?: Date | null
  updatedAt?: Date | null
  reference?: string | null
  description?: string | null
  type?: string | null
  [key: string]: any
}

// Helper function to query Pinspay Virtual Funding status
const queryVirtualFunding = async (
  request_id: string
): Promise<PinspayQueryResponse> => {
  logger.info('[PinspayWebhook] queryVirtualFunding: Initiated query', {
    request_id
  })

  const pinspayApiKey = config.pinspayToken // Ensure this is defined in your config
  const pinspayQueryUrl = `https://pinspay.com/api/virtualfundingrequery`

  if (!pinspayApiKey) {
    logger.error(
      '[PinspayWebhook] queryVirtualFunding: PINSPAY_API_KEY is not defined in environment variables.'
    )
    return { status: '500', message: 'Internal server error: API key missing.' }
  }

  try {
    const payload = { request_id }
    logger.debug(
      '[PinspayWebhook] queryVirtualFunding: Sending request to Pinspay API',
      {
        url: pinspayQueryUrl,
        payload
      }
    )

    const response: AxiosResponse<PinspayQueryResponse> = await axios.post(
      pinspayQueryUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: pinspayApiKey
        }
      }
    )

    logger.info(
      '[PinspayWebhook] queryVirtualFunding: Received response from Pinspay API',
      {
        httpStatus: response.status,
        responseData: response.data
      }
    )

    if (response.data && response.data.status === '200') {
      logger.info(
        '[PinspayWebhook] queryVirtualFunding: Pinspay query successful.',
        {
          request_id,
          pinspayResponse: response.data
        }
      )
      return response.data
    } else {
      logger.warn(
        '[PinspayWebhook] queryVirtualFunding: Pinspay query failed or returned non-200 status.',
        { request_id, pinspayResponse: response.data }
      )
      return (
        response.data || {
          status: '400',
          message: 'Query failed with unexpected response.'
        }
      )
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Unknown error during Pinspay query.'
    logger.error(
      '[PinspayWebhook] queryVirtualFunding: Error during API request to Pinspay',
      {
        request_id,
        error: errorMessage,
        stack: error.stack,
        axiosResponseData: error.response?.data,
        axiosResponseStatus: error.response?.status
      }
    )
    return { status: '500', message: `API request failed: ${errorMessage}` }
  }
}

// Main webhook handler
export const handlePinspayWebhook = async (
  req: Request,
  res: Response
): Promise<any> => {
  const payload: PinspayWebhookPayload = req.body
  logger.info('[PinspayWebhook] Webhook received', { payload })

  const { request_id, virtual_account, amount_funded } = payload

  if (!request_id || !virtual_account || !amount_funded) {
    logger.error('[PinspayWebhook] Webhook missing required fields', {
      payload
    })
    // As per PHP code, return 200 OK even if fields are missing to prevent retries
    return res.status(200).json({ status: '200', message: 'Successful' })
  }

  try {
    const userAccount = await prisma.virtualAccount.findFirst({
      where: { accountNumber: virtual_account }
    })

    const user = await prisma.users.findUnique({
      where: { id: userAccount?.userId }
    })
    if (!user) {
      logger.warn('[PinspayWebhook] User not found for virtual account', {
        virtual_account
      })
      return res.status(200).json({ status: '200', message: 'Successful' })
    }
    logger.info('[PinspayWebhook] User found', {
      userId: user.id,
      userEmail: user.email
    })

    // Fetch user's wallet
    const wallet = (await prisma.wallet.findUnique({
      where: { user_id: user.id }
    })) as Wallet | null

    if (!wallet) {
      logger.error('[PinspayWebhook] Wallet not found for user', {
        userId: user.id
      })
      return res.status(200).json({ status: '200', message: 'Successful' })
    }
    logger.info('[PinspayWebhook] Wallet found', {
      walletId: wallet.id,
      userId: user.id
    })

    // Call the queryVirtualFunding function to verify the transaction
    const queryResponse = await queryVirtualFunding(request_id)

    if (
      queryResponse.status === '200' &&
      (queryResponse as PinspayQuerySuccessResponse).data
    ) {
      const queryData = (queryResponse as PinspayQuerySuccessResponse).data
      logger.info(
        '[PinspayWebhook] Transaction verification successful from Pinspay query',
        {
          request_id,
          queryData
        }
      )

      const requestRef = queryData.requestID

      if (!requestRef) {
        logger.error(
          '[PinspayWebhook] Missing requestID in Pinspay query response data',
          {
            queryResponse
          }
        )
        return res.status(200).json({ status: '200', message: 'Successful' })
      }

      // Check if the reference already exists in wallet history
      const existingTransaction = await prisma.wallet_histories.findFirst({
        where: { reference: requestRef }
      })

      if (existingTransaction) {
        logger.warn('[PinspayWebhook] Transaction already processed', {
          reference: requestRef,
          existingTransactionId: existingTransaction.id
        })
        return res.status(200).json({ status: '200', message: 'Successful' })
      }

      // Credit the user's wallet and record history in a transaction
      try {
        await prisma.$transaction(async tx => {
          // Update wallet balance
          const updatedWallet = await tx.wallet.update({
            where: { user_id: user.id },
            data: {
              balance: wallet.balance + Number(amount_funded),
              updated_at: new Date()
            }
          })
          logger.debug('[PinspayWebhook] Wallet balance updated', {
            walletId: updatedWallet.code,
            newBalance: updatedWallet.balance
          })

          // Create wallet history entry
          await tx.wallet_histories.create({
            data: {
              amount: Number(amount_funded),
              userId: BigInt(user!.id), // Ensure userId is BigInt if your schema dictates
              source: 'PINSPAY',
              channel: 'VIRTUAL_ACCOUNT',
              status: '1',
              balanceAfter: Number(updatedWallet.balance),
              reference: requestRef,
              description: 'Wallet Funding via Pinspay Virtual Account',
              type: 'CREDIT',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          logger.info(
            '[PinspayWebhook] Wallet history recorded and wallet credited successfully',
            {
              userId: user!.id,
              amount: amount_funded,
              reference: requestRef
            }
          )
        })
      } catch (dbError: any) {
        logger.error(
          '[PinspayWebhook] Database transaction failed during wallet crediting',
          {
            userId: user.id,
            amount: amount_funded,
            reference: requestRef,
            error: dbError.message,
            stack: dbError.stack
          }
        )
        return res.status(200).json({ status: '200', message: 'Successful' })
      }
    } else {
      logger.warn(
        '[PinspayWebhook] Transaction verification failed from Pinspay query',
        {
          request_id,
          queryResponse
        }
      )
    }

    return res.status(200).json({ status: '200', message: 'Successful' })
  } catch (error: any) {
    logger.error('[PinspayWebhook] Unhandled error in webhook processing', {
      payload,
      error: error.message,
      stack: error.stack
    })
    return res.status(200).json({ status: '200', message: 'Successful' })
  }
}

export const getAllBanks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { data } = await axios.get(
      'https://pinspay.com/api/bankListNIP',

      {
        headers: { apiKey: config.pinspayToken }
      }
    )
    if (data.status === '200') {
      return res.status(200).json({ banks: data.data, status: true })
    }
    return res
      .status(400)
      .json({ status: false, message: 'Something went wrong' })
  } catch (error) {
    logger.error('[GET_BANKS] Unexpected error', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return res
      .status(500)
      .json({ message: 'Something went wrong', status: false })
  }
}

export const getAccountdetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { bankNo, bankCode } = req.body

  try {
    const { data } = await axios.post(
      'https://pinspay.com/api/accountNameNIP',
      { bankKey: bankNo, accountNumber: bankCode },
      {
        headers: { apiKey: config.pinspayToken }
      }
    )

    if (data.status === '200' || data.status) {
      return res.status(200).json({ data, status: true })
    }
    return res
      .status(400)
      .json({ status: false, message: 'Something went wrong' })
  } catch (error) {
    logger.error('[GET_aCCOUNT_INFO] Unexpected error', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return res
      .status(500)
      .json({ message: 'Something went wrong', status: false })
  }
}

export const initiatePayout = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    amount,
    destAccount,
    destAccountName,
    nameEnquiryRef,
    bankVerificationNumber,
    KYCLevel,
    bankCode,
    bankName,
    request_id,
    pin
  } = req.body

  try {
    logger.info('[PAYOUT_INITIATION] Starting payout process', {
      userId: req.user?.id,
      amount,
      destAccount,
      bankCode,
      bankName,
      request_id
    })

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized', status: false })
    }

    if (
      !amount ||
      !destAccount ||
      !destAccountName ||
      !bankCode ||
      !bankName ||
      !nameEnquiryRef ||
      !bankVerificationNumber ||
      !KYCLevel ||
      !request_id ||
      !pin
    ) {
      return res
        .status(400)
        .json({ message: 'All fields are required', status: false })
    }

    // ✅ Check PIN
    const pinValidator = new UserController(req.user.id)
    const pinValidation = await pinValidator.checkPin(pin)
    if (!pinValidation?.status) {
      return res
        .status(400)
        .json({ message: pinValidation?.message, status: false })
    }

    // ✅ Check for existing transaction by requestId
    const existingTxn = await prisma.transactions.findFirst({
      where: { reference: request_id }
    })
    if (existingTxn) {
      return res
        .status(400)
        .json({ message: 'Duplicate request', status: false })
    }

    // ✅ Debit wallet
    const transCode = Date.now().toString()

    const debitResult = await debitUser(
      Number(amount),
      req.user.id,
      'Wallet Payout',
      request_id,
      'PAYOUT'
    )

    if (!debitResult.status) {
      return res
        .status(400)
        .json({ message: 'Insufficient wallet balance', status: false })
    }

    // ✅ Prepare payout payload
    const payload = {
      amount,
      destAccount,
      destAccountName,
      nameEnquiryRef,
      bankVerificationNumber,
      KYCLevel,
      bankCode,
      bankName,
      narration: `Wallet payout from ${req.user.fullName || 'User'}`
    }

    const { data } = await axios.post(
      'https://pinspay.com/api/NIPCashoutTransfer',
      payload,
      {
        headers: {
          apiKey: config.pinspayToken
        }
      }
    )

    logger.info('[PAYOUT_INITIATION] Pinspay response received', { data })

    let txnStatus: 'Successful' | 'Failed' | 'Pending' = 'Pending' // Default: Pending
    let payoutRef = data?.requestId || ''

    if (data.status === '200') {
      txnStatus = 'Successful' // Successful
    } else if (data.status.startsWith('3') || data.status.startsWith('5')) {
      txnStatus = 'Failed' // Failed
    }

    // ✅ Save transaction record
    await prisma.transactions.create({
      data: {
        reference: payoutRef,
        operator_unique_id: request_id,
        user_id: req.user.id,
        amount: Number(amount),
        reason: 'Bank Payout',
        status: txnStatus,
        operator_name: destAccount,
        email: req.user.email
      }
    })

    // ✅ Refund on failure (3xx / 5xx)
    if (txnStatus === 'Failed') {
      await creditUser(
        Number(amount),
        req.user.id,
        'PAYOUT_REVERSAL',
        transCode,
        'REVERSAL'
      )
      return res.status(400).json({
        status: false,
        message: data.message || 'Payout failed'
      })
    }

    // ✅ Pending
    if (txnStatus === 'Pending') {
      return res.status(202).json({
        status: false,
        message: data.message || 'Payout pending',
        reference: transCode,
        payoutRef
      })
    }

    // ✅ Success
    return res.status(200).json({
      status: true,
      message: 'Payout successful',
      reference: transCode,
      payoutRef
    })
  } catch (error) {
    logger.error('[PAYOUT_INITIATION] Unexpected error', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return res
      .status(500)
      .json({ message: 'Something went wrong', status: false })
  }
}
