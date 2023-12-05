/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  type RingoError,
  type RingoAirtimePurchase,
  type dataBundles,
  type RingoDataPurchase
} from './airtime.interfaces'
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { type Request, type Response } from 'express'
import { networkProductId } from '../../utils/networkcheck'
import axios, { type AxiosError } from 'axios'
import config from '../../config'
import { WalletController } from '../../utils/Wallet'
import prisma from '../../db/prisma'
import { v4 as uuid } from 'uuid'
import logger from '../../common/logger'
import HTTP_STATUS_CODE from '../../constants/httpCode'
import { Prisma } from '@prisma/client'
import { User } from '../../utils/User'

export const purchaseAirtime = async (req: Request, res: Response) => {
  const { amount, phone, request_id, network, pin } = req.body
  const trans_code = uuid()
  try {
    const product_id = networkProductId(network)

    if (req.user?.id == null) {
      return res
        .status(400)
        .json({ message: 'authentication failed', success: false })
    }

    const checkRequestID = await prisma.airtime_requests.findUnique({
      where: { request_id }
    })
    if (checkRequestID) {
      return res
        .status(400)
        .json({ message: 'duplicate request id', status: false })
    }
    const checkPin = new User(req.user.id)
    const pinCheck = await checkPin.checkPin(pin)
    if (!pinCheck.success) {
      return res.status(400).json({ success: false, message: pinCheck.message })
    }
    const checkUser = new User(req.user.id)
    const checkedUser = await checkUser.checkDailyTransactions(Number(amount))
    if (!checkedUser?.status) {
      return res
        .status(400)
        .json({ message: checkedUser?.message, success: false })
    }
    const checkBalance = new WalletController(
      'check',
      Number(amount),
      '',
      req.user?.id
    )
    const balanceCheck = await checkBalance.checkBalance()
    if (!balanceCheck.status) {
      return res
        .status(400)
        .json({ message: balanceCheck.message, status: false })
    }

    const insert = await prisma.airtime_requests.create({
      data: {
        user_id: req.user.id,
        amount,
        network,
        trans_code,
        request_id,
        phone,
        status: 'Pending',
        payload: req.body
      }
    })

    logger.info(JSON.stringify(insert))
    const debitUser = await checkBalance.debit()
    if (!debitUser.status) {
      return res
        .status(400)
        .json({ message: debitUser.message, success: false })
    }

    try {
      const { data } = await axios.post(
        'https://approot.ng/ringoPaytest/public/api/agent/p2',
        {
          serviceCode: 'VAR',
          msisdn: '2348023126439',
          amount: '50',
          request_id: 'vsacklkLmskkkk2',
          product_id
        },
        {
          headers: { email: config.ringoEmail, password: config.ringoPassword }
        }
      )
      logger.info(JSON.stringify(data))
      const response = data as RingoAirtimePurchase
      if (response.status === '200') {
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: response.TransRef,
            amount,
            reference: trans_code,
            status: 'Successful',
            reason: 'AIRTIME_PURCHASE'
          }
        })
        await prisma.airtime_requests.update({
          where: { trans_code },
          data: { status: 'Successful' }
        })
        return res.status(200).json({
          message: 'successful purchase of airtime',
          status: true,
          amount,
          network
        })
      } else if (response.TransRef === '300') {
        await checkBalance.credit()
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: `RINGO-AIRTIME PURCHASE`,
            amount,
            reference: trans_code,
            status: 'Failed',
            reason: 'AIRTIME_PURCHASE'
          }
        })
        await prisma.airtime_requests.update({
          where: { trans_code },
          data: { status: 'Failed' }
        })
        return res.status(400).json({
          message: 'unsuccessful purchase of airtime',
          status: false
        })
      } else {
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: `RINGO-AIRTIME PURCHASE`,
            amount,
            reference: trans_code,
            status: 'Pending',
            reason: 'AIRTIME_PURCHASE'
          }
        })
        return res.status(400).json({
          message: 'pending purchase of airtime',
          status: false
        })
      }
    } catch (error) {
      const err = error as AxiosError<RingoError>
      if (err?.response?.data != null) {
        return res
          .status(400)
          .json({ mmessage: err.response.data.message, status: false })
      }
      return res.status(400).json({ error })
    }
  } catch (error) {
    return res.status(400).json({ error })
  }
}

export const purchaseData = async (req: Request, res: Response) => {
  const { product_id, phone, request_id, pin } = req.body
  const trans_code = uuid()

  if (req.user?.id == null) {
    return res
      .status(400)
      .json({ message: 'authentication failed', success: false })
  }

  const checkRequestID = await prisma.data_requests.findUnique({
    where: { request_id }
  })
  if (checkRequestID) {
    return res
      .status(400)
      .json({ message: 'duplicate request id', status: false })
  }
  const checkPin = new User(req.user.id)
  const pinCheck = await checkPin.checkPin(pin)
  if (!pinCheck.success) {
    return res.status(400).json({ success: false, message: pinCheck.message })
  }
  const productIdCheck = await prisma.dataProducts.findUnique({
    where: { product_id }
  })
  if (!productIdCheck) {
    return res
      .status(400)
      .json({ message: 'product not available', status: false })
  }
  const checkUser = new User(req.user.id)
  const checkedUser = await checkUser.checkDailyTransactions(
    Number(productIdCheck.price)
  )
  if (!checkedUser?.status) {
    return res
      .status(400)
      .json({ message: checkedUser?.message, success: false })
  }
  const checkBalance = new WalletController(
    'check',
    Number(productIdCheck.price),
    '',
    req.user?.id
  )
  const balanceCheck = await checkBalance.checkBalance()
  if (!balanceCheck.status) {
    return res
      .status(400)
      .json({ message: balanceCheck.message, status: false })
  }

  const insert = await prisma.data_requests.create({
    data: {
      user_id: req.user.id,
      amount: productIdCheck.price,
      network: productIdCheck.network,
      trans_code,
      request_id,
      phone,
      status: 'Pending',
      payload: req.body
    }
  })

  logger.info(JSON.stringify(insert))
  const debitUser = await checkBalance.debit()
  if (!debitUser.status) {
    return res.status(400).json({ message: debitUser.message, success: false })
  }

  try {
    try {
      const { data } = await axios.post(
        'https://approot.ng/ringoPaytest/public/api/agent/p2',
        {
          serviceCode: 'ADA',
          msisdn: phone,
          request_id,
          product_id
        },
        {
          headers: {
            email: config.ringoEmail,
            password: config.ringoPassword
          }
        }
      )
      logger.info(JSON.stringify(data))
      const response = data as RingoDataPurchase
      if (response.status === '200') {
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: response.TransRef,
            amount: response.amountCharged,
            reference: trans_code,
            status: 'Successful',
            reason: 'DATA_PURCHASE'
          }
        })
        await prisma.users.update({
          where: { id: req.user.id },
          data: { dailyTransaction: Number(productIdCheck.price) }
        })
        await prisma.data_requests.update({
          where: { trans_code },
          data: { status: 'Successful' }
        })
        return res.status(200).json({
          message: 'successful purchase of data',
          status: true,
          amount: response.amountCharged,
          network: response.network
        })
      } else if (response.TransRef === '300') {
        await checkBalance.credit()
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: `RINGO-DATA PURCHASE`,
            amount: response.amountCharged,
            reference: trans_code,
            status: 'Failed',
            reason: 'DATA_PURCHASE'
          }
        })
        await prisma.data_requests.update({
          where: { trans_code },
          data: { status: 'Failed' }
        })
        return res.status(400).json({
          message: 'unsuccessful purchase of data',
          status: false
        })
      } else {
        await prisma.transactions.create({
          data: {
            user_id: req.user.id,
            email: req.user.email,
            operator_name: 'RINGO',
            operator_unique_id: `RINGO-DATA PURCHASE`,
            amount: response.amountCharged,
            reference: trans_code,
            status: 'Pending',
            reason: 'DATA_PURCHASE'
          }
        })
        return res.status(400).json({
          message: 'pending purchase of DATA',
          status: false
        })
      }
    } catch (error) {
      const err = error as AxiosError<RingoError>
      if (err?.response?.data != null) {
        return res
          .status(400)
          .json({ mmessage: err.response.data.message, status: false })
      }
      return res.status(400).json({ error })
    }
  } catch (error) {
    return res.status(400).json({ error })
  }
}

export const insertData = async (req: Request, res: Response) => {
  const { data } = req.body

  try {
    const itemstoBeAdded = data as dataBundles[]
    itemstoBeAdded.forEach(async item => {
      try {
        await prisma.dataProducts.create({
          data: {
            price: item.price,
            product_id: item.product_id,
            validity: item.validity,
            allowance: item.allowance,
            network: item.network
          }
        })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          logger.info(error)
          if (error.code === 'P2002') {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
              message:
                'There is a unique constraint violation, a new user cannot be created with this email',
              err: error.message,
              success: false
            })
          }
          logger.info(error)
          return res
            .status(HTTP_STATUS_CODE.BAD_REQUEST)
            .json({ error, success: false })
        }
        logger.info('Error')
        logger.info(error)
        return res.status(400).json({ error })
      }
    })

    return res.status(200).json({ message: 'products added', status: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      logger.info(error)
      if (error.code === 'P2002') {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          message:
            'There is a unique constraint violation, a new user cannot be created with this email',
          err: error.message,
          success: false
        })
      }
      logger.info(error)
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error, success: false })
    }
    logger.info('Error')
    logger.info(error)
    return res.status(400).json({ error })
  }
}

export const getDataPlans = async (req: Request, res: Response) => {
  const { network } = req.params

  try {
    logger.info(JSON.stringify(req.params))
    const findPlans = await prisma.dataProducts.findMany({
      where: {
        network
      }
    })
    if (!findPlans)
      return res.status(400).json({ message: 'not found', status: false })
    return res
      .status(200)
      .json({ message: 'success', findPlans, success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      logger.info(error)
      if (error.code === 'P2002') {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          message:
            'There is a unique constraint violation, a new user cannot be created with this email',
          err: error.message,
          success: false
        })
      }
      logger.info(error)
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error, success: false })
    }
    logger.info('Error')
    logger.info(error)
    return res.status(400).json({ error })
  }
}
