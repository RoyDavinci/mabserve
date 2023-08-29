/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { AxiosError } from 'axios'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import logger from '../../common/logger'
import {
  KeGowPaymentResponse,
  type FlutterWaveTransferIntegration,
  type VerifyAccountNumber
} from './payment.interface'
import prisma from '../../db/prisma'
import { Prisma } from '@prisma/client'
import HTTP_STATUS_CODE from '../../constants/httpCode'
import { WalletController } from '../../utils/Wallet'

export const getBanks = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(
      `${config.CHAMS_MOBILE_BASEURL}/transfer/fetch-banks`,
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )
    return res.status(200).json({ data, success: true })
  } catch (error) {
    const err = error as AxiosError
    if (err.response != null) {
      return res
        .status(400)
        .json({ success: false, messsage: err.response.data })
    }
    return res.status(400).json({ success: false, messsage: error })
  }
}

export const verifyAccount = async (req: Request, res: Response) => {
  const { beneficiaryBankCode, beneficiaryAccountNumber } = req.body
  if (req.user == null)
    return res
      .status(403)
      .json({ message: 'authentication required', success: false })

  try {
    const findUser = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { wallet: true }
    })
    if (findUser == null)
      return res.status(400).json({ message: 'user not found', succes: false })

    const { data } = await axios.post(
      `${config.CHAMS_MOBILE_BASEURL}/transfer/verify-bank-account`,
      {
        accountNo: beneficiaryAccountNumber,
        bankCode: beneficiaryBankCode
      },
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )
    return res
      .status(200)
      .json({ message: 'successfully validated', success: true, data })
  } catch (error) {
    const err = error as AxiosError
    if (err !== null) {
      logger.info('Err')
      logger.error(err.response?.data)
      return res.status(400).json({ message: err.response?.data, issue: err })
    }
  }
}

export const kegowBankPayment = async (req: Request, res: Response) => {
  const {
    narration,
    amount,
    beneficiaryBankCode,
    beneficiaryAccountNumber
    // beneficiaryAccountName
  } = req.body

  if (req.user == null)
    return res
      .status(403)
      .json({ message: 'authentication required', success: false })

  try {
    const findUser = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { wallet: true }
    })
    if (findUser == null)
      return res.status(400).json({ message: 'user not found', succes: false })

    const { data } = await axios.post(
      `${config.CHAMS_MOBILE_BASEURL}/transfer/verify-bank-account`,
      {
        accountNo: beneficiaryAccountNumber,
        bankCode: beneficiaryBankCode
      },
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )
    const response = data as VerifyAccountNumber
    logger.info(response)
    if (response.account.responseCode === '00') {
      const systemUser = new WalletController(
        narration,
        amount,
        'TYPE',
        req.user.id
      )
      const checkSystemUser = await systemUser.debit()
      if (!checkSystemUser.status) {
        return res.status(400).json({ message: 'an error occured' })
      }
      const { data } = await axios.post(
        `${config.CHAMS_MOBILE_BASEURL}/transfer/wallet-to-bank`,
        {
          beneficiaryAccountName: response.account.beneficiaryAccountName,
          beneficiaryAccountNumber: response.account.beneficiaryAccountNumber,
          beneficiaryBankCode: response.account.beneficiaryBankCode,
          narration,
          amount,
          beneficiaryNameEnquiryRefrenceNumber:
            response.account.beneficiaryNameEnquiryRefrenceNumber,
          bankVerificationNumber: response.account.bankVerificationNumber,
          beneficiaryKYCLevel: response.account.kyclevel,
          wallet_account_number: findUser.wallet?.wallet_id
        },
        {
          headers: {
            Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
          }
        }
      )
      const paymentResponse = data as KeGowPaymentResponse
      if (paymentResponse.message === 'Transfer Successful') {
        return res
          .status(200)
          .json({ success: true, message: 'Transfer Successful' })
      } else {
        const systemUser = new WalletController(
          narration,
          amount,
          'TYPE',
          req.user.id
        )
        const checkSystemUser = await systemUser.credit()
        if (checkSystemUser.status) {
          return res.status(400).json({ message: 'an error occured' })
        }
      }

      return res.status(200).json({ success: true, data })
    }

    return res.status(400).json({ success: false, message: 'an error occured' })
    // logger.info(data)
  } catch (error) {
    const err = error as AxiosError
    if (err !== null) {
      logger.info('Err')
      logger.error(err.response?.data)
      return res.status(400).json({ message: err.response?.data })
    }
  }
}

export const initiatePaymentToBank = async (req: Request, res: Response) => {
  const { account_bank, account_number, amount, email, narration } = req.body

  try {
    logger.info(JSON.stringify(req.body))
    if (req.user == null)
      return res.status(400).json({ message: 'user not authenticated' })
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/transfers',
      {
        account_bank,
        account_number,
        amount,
        currency: 'NGN',
        tx_ref: uuidv4().slice(0, 8),
        email
      },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    // logger.info(data)
    const fetchUser = await prisma.wallet.findUnique({
      where: { user_id: req.user.id }
    })
    if (fetchUser == null)
      return res
        .status(400)
        .json({ message: 'an error occured', success: false })
    if (Number(fetchUser.balance) < Number(amount))
      return res.status(400).json({
        message: 'insufficient balance to complete transaction',
        success: false
      })
    const response = data as unknown as FlutterWaveTransferIntegration
    logger.info(response)
    if (response.status === 'success') {
      await prisma.$transaction([
        prisma.wallet.update({
          where: { user_id: req.user.id },
          data: {
            balance: { decrement: Number(amount) + Number(response.data.fee) }
          }
        }),
        prisma.transactions.create({
          data: {
            email,
            name: req.user.first_name,
            amount,
            reference: response.data.reference,
            user_id: req.user.id,
            operator_name: 'Flutterwave',
            operator_unique_id: response.data.reference,
            reason: narration,
            payload: JSON.stringify(req.body),
            response: JSON.stringify(response)
          }
        })
      ])
      return res.status(200).json({
        message: 'successful',
        status: true,
        reference: response.data.reference
      })
    }
    return res.status(400).json({
      success: false,
      message: 'an error occured on payment integration'
    })
  } catch (error) {
    logger.error(error)
    const err = error as AxiosError
    logger.error(err)
    if (err.response != null) {
      return res
        .status(400)
        .json({ success: false, message: err?.response.data })
    }
    return res.status(400).json({ success: false, message: error })
  }
}

export const transferToAirbank = async (req: Request, res: Response) => {
  const { wallet, amount, narration } = req.body

  if (req.user == null)
    return res
      .status(403)
      .json({ message: 'authentication required', success: false })
  const findUser = await prisma.users.findUnique({
    where: { id: req.user.id },
    include: { wallet: true }
  })
  if (findUser == null)
    return res.status(400).json({ message: 'user not found', succes: false })
  const fetchUser = await prisma.wallet.findFirst({
    where: { wallet_id: wallet },
    include: { Users: true }
  })
  if (fetchUser == null)
    return res.status(400).json({ message: 'an error occured', success: false })
  try {
    if (Number(amount) > Number(fetchUser.balance))
      return res.status(400).json({
        message: 'insufficient balance to complete transaction',
        success: false
      })

    try {
      await prisma.$transaction([
        prisma.wallet.update({
          where: { user_id: req.user.id },
          data: { balance: { decrement: Number(amount) } }
        }),
        prisma.wallet.update({
          where: { user_id: fetchUser.user_id },
          data: { balance: { increment: Number(amount) } }
        }),
        prisma.transactions.create({
          data: {
            operator_name: 'Kegow',
            email: req.user.email,
            operator_unique_id: `debit-System Transaction-${uuidv4().slice(
              1,
              5
            )}`,
            amount,
            reference: uuidv4(),
            user_id: req.user.id,
            payload: req.body,
            reason: narration,
            status: 'Successful'
          }
        }),
        prisma.transactions.create({
          data: {
            operator_name: 'Kegow',
            email: fetchUser.Users.email,
            operator_unique_id: `credit-System Transaction-${uuidv4().slice(
              1,
              5
            )}`,
            amount,
            reference: uuidv4(),
            user_id: fetchUser.Users.id,
            payload: req.body,
            reason: narration,
            status: 'Successful'
          }
        })
      ])
    } catch (error) {
      logger.info(error)
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        error,
        message: 'an error occured on crediting a user',
        success: false
      })
    }
    return res
      .status(200)
      .json({ message: 'user credited successfully', success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      logger.info(error)
      if (error.code === 'P2002') {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          message:
            'There is a unique constraint violation, a new user cannot be created with this email',
          success: false,
          err: error.message
        })
      }
      logger.info(error)
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error, success: false })
    } else if (error instanceof AxiosError) {
      const err = error as AxiosError
      if (err !== null) {
        await prisma.$transaction([
          prisma.transactions.create({
            data: {
              operator_name: 'Kegow',
              email: req.user.email,
              operator_unique_id: `debit-${uuidv4()}`,
              amount,
              reference: uuidv4(),
              user_id: req.user.id,
              payload: req.body,
              response: JSON.stringify(err.response?.data),
              status: 'Failed'
            }
          }),
          prisma.transactions.create({
            data: {
              operator_name: 'Kegow',
              email: fetchUser.Users.email,
              operator_unique_id: `credit-${uuidv4()}`,
              amount,
              reference: uuidv4(),
              user_id: fetchUser.Users.id,
              payload: req.body,
              response: JSON.stringify(err.response?.data),
              status: 'Failed'
            }
          })
        ])
        logger.info('Err')
        logger.error(err.response?.data)
        return res.status(400).json({ message: err.response?.data, issue: err })
      }
    }
    logger.error(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on crediting a wallet',
      success: false
    })
  }
}
