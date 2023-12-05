/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable camelcase */
import axios, { type AxiosError } from 'axios'
import { type Request, type Response } from 'express'
import config from '../../config'
import logger from '../../common/logger'
import { v4 as uuid } from 'uuid'
import { type RingoError } from '../airtime/airtime.interfaces'
import {
  type RingoElectricityPurchase,
  type RingoElectricityValidate
} from './electricity.interfaces'
import prisma from '../../db/prisma'
import { WalletController } from '../../utils/Wallet'
import { User } from '../../utils/User'

export const validateElectricity = async (req: Request, res: Response) => {
  const { disco, meterNo, type } = req.body

  try {
    const { data } = await axios.post(
      'https://approot.ng/ringoPaytest/public/api/agent/p2',
      {
        serviceCode: 'V-ELECT',
        disco,
        meterNo,
        type
      },
      {
        headers: {
          email: config.ringoEmail,
          password: config.ringoPassword
        }
      }
    )

    const response = data as RingoElectricityValidate
    if (response.status === '200') {
      return res.status(200).json({
        meterNo: response.meterNo,
        customerName: response.customerName,
        customerAddress: response.customerAddress,
        customerDistrict: response.customerDistrict,
        phoneNumber: response.phoneNumber,
        type: response.type,
        disco: response.disco,
        status: true
      })
    }
    return res
      .status(400)
      .json({ message: ' an error occured on validation', status: false })
  } catch (error) {
    const err = error as AxiosError<RingoError>
    if (err?.response?.data != null) {
      return res
        .status(400)
        .json({ mmessage: err.response.data.message, status: false })
    }
    return res.status(400).json({ error })
  }
}

export const purchaseElectricity = async (req: Request, res: Response) => {
  const { phone, amount, type, request_id, meterNo, disco, pin } = req.body
  const trans_code = uuid()
  if (req.user?.id == null) {
    return res
      .status(400)
      .json({ message: 'authentication failed', success: false })
  }
  const checkRequestID = await prisma.electricity_requests.findUnique({
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
  const insert = await prisma.electricity_requests.create({
    data: {
      user_id: req.user.id,
      amount,
      type,
      trans_code,
      request_id,
      meterNumber: meterNo,
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
    const { data } = await axios.post(
      'https://approot.ng/ringoPaytest/public/api/agent/p2',
      {
        serviceCode: 'P-ELECT',
        disco,
        meterNo,
        type: type.toUpperCase(),
        amount,
        phonenumber: phone,
        request_id
      },
      {
        headers: {
          email: config.ringoEmail,
          password: config.ringoPassword
        }
      }
    )
    const response = data as RingoElectricityPurchase
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
          reason: 'ELECTRICITY_PURCHASE'
        }
      })
      await prisma.electricity_requests.update({
        where: { trans_code },
        data: { status: 'Successful' }
      })
      await prisma.users.update({
        where: { id: req.user.id },
        data: { dailyTransaction: Number(amount) }
      })
      return res.status(200).json({
        message: 'successful purchase of token',
        status: true,
        amount,
        token: response.token,
        unit: response.unit,
        amountCharged: response.amount,
        customerName: response.customerName,
        date: new Date(),
        TransRef: response.TransRef,
        disco: response.disco,
        resetToken: response.resetToken,
        configureToken: response.configureToken
      })
    } else if (response.TransRef === '300') {
      await checkBalance.credit()

      await prisma.transactions.create({
        data: {
          user_id: req.user.id,
          email: req.user.email,
          operator_name: 'RINGO',
          operator_unique_id: `RINGO-DISCO PURCHASE`,
          amount,
          reference: trans_code,
          status: 'Failed',
          reason: 'DISCO_PURCHASE'
        }
      })
      await prisma.electricity_requests.update({
        where: { trans_code },
        data: { status: 'Failed' }
      })
      return res.status(400).json({
        message: 'unsuccessful purchase of DISCO',
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
        message: 'pending purchase of electricity',
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
}
