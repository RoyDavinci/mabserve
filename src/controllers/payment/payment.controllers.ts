/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios, { type AxiosError } from 'axios'
import { type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import config from '../../config'
import logger from '../../common/logger'
import { type FlutterWavePaymentIntegration } from './payment.interface'

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
  const { account_bank, account_number, amount, email, firstname, lastname } =
    req.body

  try {
    logger.info(JSON.stringify(req.body))
    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=debit_ng_account',
      {
        account_bank,
        account_number,
        amount,
        currency: 'NGN',
        tx_ref: uuidv4().slice(0, 8),
        email,
        firstname,
        lastname
      },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    // logger.info(data)
    const response = data as unknown as FlutterWavePaymentIntegration
    if (response.data.status === 'success') {
      if (response.data.data.status === 'pending') {
        if (response.data.data.meta.authorization.mode === 'redirect') {
          return res.status(200).json({
            message: 'redirect',
            success: true,
            url: response.data.data.meta.authorization.redirect
          })
        } else {
          return res.status(200).json({
            message: 'OTP',
            success: true,
            otp: response.data.data.meta.authorization.validate_instructions
          })
        }
      }
    }
    return res.status(400).json({
      success: false,
      message: 'an error occured on payment integration'
    })
  } catch (error) {
    // logger.info(error)
    const err = error as AxiosError
    if (err.response != null) {
      return res
        .status(400)
        .json({ success: false, messsage: err?.response.data })
    }
    return res.status(400).json({ success: false, messsage: error })
  }
}
