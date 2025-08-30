/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import logger from '../../common/logger'
import {
  type KeGowPaymentResponse,
  type FlutterWaveTransferIntegration,
  type VerifyAccountNumber,
  type FlutterWaveCharge,
  type flutterWaveCardErrorRespnse,
  type FlutterwavePaymentResponse,
  type ChargeCompleteResponse,
  type VirtualAccountResponse,
  type FlutterwaveChargeResponse
} from './payment.interface'
import prisma from '../../db/prisma'
import { Prisma } from '@prisma/client'
import HTTP_STATUS_CODE from '../../constants/httpCode'
import { WalletController } from '../../utils/Wallet'
import { User } from '../../utils/User'
import { encrypt } from '../../utils/forge'
import getEncryptionKey from '../../utils/encryption'

export const getBanks = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(
      `https://api.flutterwave.com/v3/banks/NG`,
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
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

    const checkUser = new User(req.user.id)
    const checkVerification = await checkUser.checkKyc()
    if (!checkVerification?.status) {
      return res
        .status(400)
        .json({ message: checkVerification?.message, success: false })
    }
    const checkedUser = await checkUser.checkDailyTransactions(Number(amount))
    if (!checkedUser?.status) {
      return res
        .status(400)
        .json({ message: checkedUser?.message, success: false })
    }
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
    // const actualAmount = Number(amount) + 20
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
            name: req.user.fullName,
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
      await prisma.users.update({
        where: { id: req.user.id },
        data: { dailyTransaction: Number(amount) }
      })
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
  const { wallet, amount, narration, pin } = req.body

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
    return res
      .status(400)
      .json({ message: 'User Verification not successful', success: false })
  try {
    if (!req.user.pin_auth) {
      return res
        .status(400)
        .json({ success: false, message: 'please activate transaction pin' })
    }
    const checkPin = new User(req.user.id)
    const pinCheck = await checkPin.checkPin(pin)
    if (!pinCheck.success) {
      return res.status(400).json({ success: false, message: pinCheck.message })
    }
    if (Number(amount) > Number(findUser.wallet?.balance))
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
    return res.status(200).json({
      message: 'user credited successfully',
      success: true,
      balance: findUser.wallet?.balance
    })
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
    }
    logger.error(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on crediting a wallet',
      success: false
    })
  }
}

export const fundWallet = async (req: Request, res: Response) => {
  const { amount, email } = req.body

  if (req.user == null) {
    return res
      .status(400)
      .json({ message: 'UnAuthorized transaction', success: false })
  }
  try {
    const transRef = uuidv4()
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=bank_transfer',
      { amount, email, currency: 'NGN', tx_ref: transRef },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    logger.info(data)
    const response = data as FlutterWaveCharge
    if (response.status === 'success') {
      await prisma.transactions.create({
        data: {
          user_id: req.user.id,
          email,
          operator_name: 'FlutterWave',
          operator_unique_id: transRef,
          amount,
          reference: transRef,
          payload: req.body,
          reason: 'CREDIT ACCOUNT',
          name: req.user.fullName
        }
      })
      await prisma.wallet.update({
        where: { user_id: req.user.id },
        data: { balance: { increment: Number(amount) } }
      })

      return res.status(200).json({
        message: 'user account credited successfully',
        bank: response.meta.authorization.transfer_bank,
        account: response.meta.authorization.transfer_account,
        status: true
      })
    }
    return res
      .status(400)
      .json({ message: 'transfer not successful', status: false })
  } catch (error) {
    const err = error as AxiosError

    if (err) {
      logger.info(err.response?.data)
      return res.status(400).json({ err })
    }
    return res.status(400).json({ error })
  }
}

export const fundWalletViaCard = async (req: Request, res: Response) => {
  const {
    amount,
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    email,
    authorization
  } = req.body

  if (!req.user) {
    return res
      .status(400)
      .json({ message: 'please login again', status: false })
  }
  const transRef = uuidv4()
  try {
    const client = encrypt(config.flutterWaveEncryption, {
      amount,
      email,
      tx_ref: transRef,
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      currency: 'NGN',
      authorization
    })
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=card',
      { client },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    return res.status(200).json({ status: true, data })
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        err: err.response?.data,
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const verifyFlutterWavePayment = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { data } = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${id}/verify`,
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )

    return res.status(200).json({ data })
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const testBankTransfer = async (req: Request, res: Response) => {
  const {
    account_bank,
    account_number,
    amount,
    email,
    tx_ref,
    currency,
    phone_number,
    fullname
  } = req.body

  try {
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=debit_ng_account',
      {
        account_bank,
        account_number,
        amount,
        email,
        tx_ref,
        currency,
        phone_number,
        fullname
      },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    return res.status(200).json({ data })
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const testMomo = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=mono',
      {
        tx_ref: 'MC-1585230ew9v5050e8dhjkss',
        amount: '500',
        account_bank: '044',
        account_number: '0690000032',
        currency: 'NGN',
        email: 'user@example.com',
        phone_number: '0902620185',
        fullname: 'Yolande Aglaé Colbert'
      },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    logger.info(data)
    return res.status(200).json({ message: 'gotten here', data })
  } catch (error) {
    logger.error(error)
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const authorization = async (req: Request, res: Response) => {
  const { city, address, state, country, zipcode } = req.body

  try {
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=card',
      { city, address, state, country, zipcode },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    return res.status(200).json({ data })
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        err: err.response?.data,
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const getDirectBanks = async (req: Request, res: Response) => {
  try {
    const response: AxiosResponse<any> = await axios.get(
      'https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-banks.js?json=1',
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    // Access the data from the response
    const data = response.data

    return res.status(200).json({ data })
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error fetching direct banks:', error)

    // Send an error response
    res.status(500).json({ error: 'Failed to fetch direct banks' })
  }
}

export const directDebit = async (req: Request, res: Response) => {
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
    where: { user_id: findUser.id },
    include: { Users: true }
  })
  if (fetchUser == null)
    return res
      .status(400)
      .json({ message: 'User Verification not successful', success: false })
  try {
    const idx = `${uuidv4().slice(1, 13)}`
    const txData = {
      PBFPubKey: config.flutterwavePublicKey,
      accountbank: req.body.accountbank,
      accountnumber: req.body.accountnumber,
      currency: req.body.currency || 'NGN',
      country: req.body.country || 'NG',
      amount: req.body.amount,
      email: req.body.email,
      passcode: req.body.passcode, // Optional (for Zenith)
      bvn: req.body.bvn,
      phonenumber: req.body.phonenumber,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      IP: req.body.IP || '127.0.0.1',
      txRef: idx,
      payment_type: 'account',
      device_fingerprint: req.body.device_fingerprint || 'N/A'
    }
    logger.info('welcome')
    logger.info(JSON.stringify(txData))

    const encryptionKey = getEncryptionKey.getEncryptionKey(
      config.flutterwaveSecret
    )
    const encryptedPayload = getEncryptionKey.encrypt(
      encryptionKey,
      JSON.stringify(txData)
    )

    const payload = {
      PBFPubKey: config.flutterwavePublicKey,
      client: encryptedPayload,
      alg: '3DES-24'
    }

    const { data } = await axios.post(
      'https://api.ravepay.co/flwv3-pug/getpaidx/api/charge',
      payload
    )

    const response = data as unknown as FlutterwavePaymentResponse

    if (response.status === 'success') {
      await prisma.transactions.create({
        data: {
          user_id: req.user.id,
          amount: req.body.amount,
          operator_name: 'Flutterwave',
          operator_unique_id: response.data.flwRef,
          email: req.user.email,
          reference: idx
        }
      })
      return res.status(200).json({
        message: 'success',
        success: true,
        status: '200',
        transactionRef: response.data.flwRef
      })
    } else {
      return res.status(400).json({ success: false, status: '400' })
    }
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        err: err.response?.data,
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const verifyDirectDebit = async (req: Request, res: Response) => {
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

  try {
    const transaction = await prisma.transactions.findFirst({
      where: { operator_unique_id: req.body.ref }
    })
    if (!transaction)
      return res.status(400).json({
        success: false,
        status: '400',
        message: 'transaction not found'
      })
    const { data } = await axios.post(
      'https://api.ravepay.co/flwv3-pug/getpaidx/api/validate',
      {
        PBFPubKey: config.flutterwavePublicKey,
        transactionreference: transaction.operator_unique_id,
        validateparameter: 'OTP',
        otp: req.body.otp,
        use_access: true
      }
    )
    const response = data as ChargeCompleteResponse
    if (response.status === 'success') {
      await prisma.wallet.update({
        where: { user_id: transaction.user_id },
        data: { balance: { increment: Number(response.data.amount) } }
      })
      await prisma.transactions.update({
        data: { status: 'Successful' },
        where: { transaction_id: transaction.transaction_id }
      })
      return res
        .status(200)
        .json({ status: '200', success: true, amount: response.data.amount })
    } else {
      await prisma.transactions.update({
        data: { status: 'Failed' },
        where: { transaction_id: transaction.transaction_id }
      })
      return res
        .status(400)
        .json({ status: '200', success: false, amount: response.data.amount })
    }
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err.response?.data)
      return res.status(400).json({
        err: err.response?.data,
        message: err.response?.data.message,
        status: false
      })
    }
    return res
      .status(400)
      .json({ error, message: 'an unknown error occured', status: false })
  }
}

export const chcekVirtualAccount = async (req: Request, res: Response) => {
  if (req.user == null)
    return res
      .status(403)
      .json({ message: 'authentication required', success: false })

  const findUser = await prisma.users.findUnique({
    where: { id: req.user.id },
    include: { wallet: true }
  })
  if (findUser == null)
    return res.status(400).json({ message: 'user not found', success: false })

  try {
    const getAccount = await prisma.virtualAccount.findFirst({
      where: { userId: req.user.id }
    })

    if (!getAccount)
      return res.status(400).json({ success: false, message: 'failed' })

    return res.status(200).json({
      success: true,
      data: {
        accountNumber: getAccount.accountNumber,
        bankName: getAccount.bankName
      }
    })
  } catch (error) {}
}

export const generateVirtualAccount = async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (req.user == null) {
    return res
      .status(403)
      .json({ message: 'Authentication required', success: false })
  }
  // Find the user in the database
  const findUser = await prisma.users.findUnique({
    where: { id: req.user.id },
    include: { wallet: true }
  })
  if (!findUser) {
    return res.status(400).json({ message: 'User not found', success: false })
  }

  logger.info(JSON.stringify(req.body))

  try {
    const { bvn, narration, email } = req.body
    if (!bvn || !narration || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'BVN, narration, and email are required'
      })
    }

    // Make a request to Flutterwave API for generating a virtual account
    const { data }: { data: VirtualAccountResponse } = await axios.post(
      'https://api.flutterwave.com/v3/virtual-account-numbers',
      {
        bvn,
        narration,
        email,
        amount: '2000',
        tx_ref: uuidv4(),
        currency: 'NGN',
        is_permanent: true
      },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.flutterwaveSecret}`
        }
      }
    )
    logger.info(`Flutterwave Response: ${JSON.stringify(data)}`)
    if (data.status === 'success') {
      const v = data.data
      logger.info(JSON.stringify(v))

      logger.info('here')
      await prisma.virtualAccount.create({
        data: {
          userId: req.user.id,
          accountNumber: v.account_number,
          bankName: v.bank_name
        }
      })
      logger.info('dead')

      return res.status(200).json({
        status: '200',
        message: data.message,
        data: {
          accountNumber: v.account_number,
          bankName: v.bank_name
        },
        success: true
      })
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to generate virtual account',
        data,
        success: false
      })
    }
  } catch (error: any) {
    if (error.response) {
      return res.status(error.response.status).json({
        status: 'error',
        message: 'Failed to generate virtual account',
        details: error.response.data
      })
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    })
  }
}

export const initiateBankTransfer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(403)
      .json({ message: 'Authentication required', success: false })
  }

  const { amount, email, fullname, phone_number } = req.body

  if (!amount || !email || !fullname || !phone_number) {
    return res.status(400).json({
      success: false,
      message: 'amount, email, fullname, and phone_number are required'
    })
  }

  try {
    const tx_ref = `TX_${uuidv4()}`
    const flwResponse = await axios.post<FlutterwaveChargeResponse>(
      'https://api.flutterwave.com/v3/charges?type=bank_transfer',
      {
        tx_ref,
        amount,
        currency: 'NGN',
        email,
        fullname,
        phone_number
      },
      {
        headers: {
          Authorization: `Bearer ${config.flutterwaveSecret}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const response = flwResponse.data

    if (response.status === 'success') {
      const auth = response.meta.authorization

      await prisma.transactions.create({
        data: {
          user_id: req.user.id,
          name: fullname,
          email,
          operator_name: auth.transfer_bank,
          operator_unique_id: auth.transfer_account,
          status: 'Pending',
          amount,
          currency: 'NGN',
          payload: req.body,
          response,
          reference: tx_ref,
          reason: 'Bank Transfer'
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Charge initiated',
        account: {
          bank: auth.transfer_bank,
          account_number: auth.transfer_account,
          amount: auth.transfer_amount
        },
        reference: tx_ref
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate charge',
        data: response
      })
    }
  } catch (error: any) {
    logger.error('Charge Error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error?.response?.data || error.message
    })
  }
}
