import { Request, Response } from 'express'
import axios from 'axios'
import config from '../../config'
import logger from '../../common/logger'
import { UserController } from '../../helpers/UserController'
import prisma from '../../db/prisma'
import { creditUser, debitUser } from '../account/WalletController.'

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
    const pinValidation = await pinValidator.checkPin(Number(pin))
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
        operator_name: 'PINSPAY',
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
