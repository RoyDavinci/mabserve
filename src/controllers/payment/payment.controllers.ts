/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { type AxiosError } from 'axios'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import logger from '../../common/logger'
import { type FlutterWaveTransferIntegration } from './payment.interface'
import prisma from '../../db/prisma'
import { Prisma } from '@prisma/client'
import HTTP_STATUS_CODE from '../../constants/httpCode'

export const getBanks = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(
      'https://api.flutterwave.com/v3/banks/NG',
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
  const { phone_number, amount } = req.body

  try {
    if (req.user == null)
      return res
        .status(403)
        .json({ message: 'authentication required', success: false })
    const findUser = await prisma.users.findUnique({
      where: { phone: phone_number }
    })
    if (findUser == null)
      return res.status(400).json({ message: 'user not found', succes: false })
    const fetchUser = await prisma.wallet.findUnique({
      where: { user_id: req.user.id }
    })
    if (fetchUser == null)
      return res
        .status(400)
        .json({ message: 'an error occured', success: false })
    if (Number(amount) > Number(fetchUser.balance))
      return res.status(400).json({
        message: 'insufficient balance to complete transaction',
        success: false
      })
    await prisma.$transaction([
      prisma.wallet.update({
        where: { user_id: req.user.id },
        data: { balance: { decrement: Number(amount) } }
      }),
      prisma.wallet.update({
        where: { user_id: fetchUser.user_id },
        data: { balance: { increment: Number(amount) } }
      })
    ])
    return res
      .status(200)
      .json({ message: 'user credited successfully', success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      logger.info(error)
      if (error.code === 'P2002') {
        logger.info(
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          message:
            'There is a unique constraint violation, a new user cannot be created with this email',
          success: false
        })
      }
      logger.info(error)
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error, success: false })
    }
    logger.info(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on creating a user',
      success: false
    })
  }
}
