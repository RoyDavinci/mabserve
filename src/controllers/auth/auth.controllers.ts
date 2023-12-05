/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs'
import { type Request, type Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../../db/prisma'
import HTTP_STATUS_CODE from '../../constants/httpCode'
import logger from '../../common/logger'
import generateToken from '../../common/generateToken'
import axios, { type AxiosError } from 'axios'
import config from '../../config'
import {
  generateRandomNewNumber,
  generateRandomNumber
} from '../../common/generateRandomNumberr'
import { type flutterWaveCardErrorRespnse } from '../payment/payment.interface'
import { type Bvn } from './auth.interfaces'

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({})
    return res
      .status(200)
      .json({ message: 'users gotten', success: true, users })
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
    logger.info(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on creating a user',
      success: false
    })
  }
}

export const createPin = async (req: Request, res: Response) => {
  const { pin } = req.body

  try {
    if (!req.user) return res.status(400).json({ message: 'not authenticated' })
    const updated = await prisma.users.update({
      where: { email: req.user.email },
      data: { pin: Number(pin), pin_auth: true }
    })
    return res.status(200).json({ message: 'user updated', updated })
  } catch (error) {
    logger.info(error)
    return res.status(400).json({ error })
  }
}

export const confirmKegowUser = async (req: Request, res: Response) => {
  const { phone } = req.params

  try {
    const { data } = await axios.get(
      `${config.CHAMS_MOBILE_BASEURL}/user/${phone}`,
      { headers: { Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}` } }
    )
    return res.status(200).json({ data })
  } catch (error) {
    const err = error as AxiosError
    if (err) {
      return res
        .status(400)
        .json({ message: 'error', error: err.response?.data })
    }
  }
  return res.status(400).json({ message: Error })
}

export const createUser = async (req: Request, res: Response) => {
  const { email, fullName, password, phone_number } = req.body

  try {
    const findUser = await prisma.users.findFirst({
      where: { email }
    })
    if (findUser)
      return res
        .status(400)
        .json({ status: false, message: `User with ${email} already exists` })
    const findPhone = await prisma.users.findFirst({
      where: { phone: phone_number }
    })
    if (findPhone)
      return res.status(400).json({
        status: false,
        message: `User with ${phone_number} already exists`
      })
    const hashedPassword = await bcrypt.hash(password, 10)
    const createdUser = await prisma.users.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        phone: phone_number
      }
    })
    const walletId = generateRandomNumber()
    const findWallet = await prisma.wallet.findFirst({
      where: { wallet_id: walletId.toString() }
    })

    if (!findWallet) {
      await prisma.wallet.create({
        data: {
          wallet_id: walletId,
          user_id: createdUser.id,
          name: 'AirBank',
          balance: Number(100000).toFixed(2)
        }
      })
      const token = generateToken({
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      })
      const checkUser = await prisma.users.findUnique({
        where: { id: createdUser.id },
        include: { wallet: true }
      })
      return res.status(201).json({
        message: 'user created successfully',
        status: true,
        user: { checkUser },
        token
      })
    }
    const newWalletId = generateRandomNewNumber()
    await prisma.wallet.create({
      data: {
        wallet_id: newWalletId,
        user_id: createdUser.id,
        name: 'AirBank',
        balance: Number(100000).toFixed(2)
      }
    })
    const token = generateToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    })
    const checkUser = await prisma.users.findUnique({
      where: { id: createdUser.id },
      include: { wallet: true }
    })
    return res.status(201).json({
      message: 'user created successfully',
      status: true,
      user: { checkUser },
      token
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
}

export const getUsersFromKegow = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(
      'https://kegow-broker-dev-soidnv4kmq-ew.a.run.app/api/kegow-merchants/users',
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )

    return res
      .status(200)
      .json({ message: 'users gotten', success: true, data })
  } catch (error) {
    const err = error as AxiosError
    if (err) {
      logger.info('Err')
      logger.error(err.response?.data)
      return res.status(400).json({ message: err.response?.data })
    }
    logger.info('Error')
    return res.status(400).json({ error })
  }
}

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (req.user == null) {
      return res.status(400).json({ message: 'user not authenticated' })
    }
    if (Number(id) !== Number(req.user.id)) {
      return res.status(400).json({
        message: 'invalid request',
        success: false
      })
    }
    const findUser = await prisma.users.findUnique({
      where: { id: Number(id) }
    })
    if (findUser == null) {
      return res
        .status(400)
        .json({ message: "user doesn't exists", success: false })
    }
    return res
      .status(400)
      .json({ message: 'user found', user: { findUser }, success: true })
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
    logger.info(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on creating a user',
      success: false
    })
  }
}

// export const editUserInfo = async (req: Request, res: Response) => {
//   const { email, password, fullName, phone } = req.body
//   const { id } = req.params

//   try {
//     if (req.user != null) {
//       if (Number(id) !== Number(req.user.id)) {
//         return res
//           .status(400)
//           .json({ message: 'invalid request', success: false })
//       }
//       const findUser = await prisma.users.findUnique({
//         where: { id: Number(id) }
//       })

//       if (findUser == null) {
//         return res
//           .status(HTTP_STATUS_CODE.BAD_REQUEST)
//           .json({ message: 'user does exist', succes: false })
//       }

//       if (password) {
//         const hashedPassword = await bcrypt.hash(password, 10)
//         const updatedUser = await prisma.users.update({
//           where: { id: Number(id) },
//           data: {
//             email,
//             password: hashedPassword,
//             fullName,
//             phone
//           }
//         })
//         return res.status(HTTP_STATUS_CODE.ACCEPTED).json({
//           message: 'user updated',
//           success: true,
//           user: { updatedUser }
//         })
//       }
//       const updatedUser = await prisma.users.update({
//         where: { id: Number(id) },
//         data: { email, fullName, phone }
//       })
//       return res.status(HTTP_STATUS_CODE.ACCEPTED).json({
//         message: 'user updated',
//         success: true,
//         user: { updatedUser }
//       })
//     }
//     return res.status(400).json({ message: 'user not authenticated' })
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       // The .code property can be accessed in a type-safe manner
//       logger.info(error)
//       if (error.code === 'P2002') {
//         return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
//           message:
//             'There is a unique constraint violation, a new user cannot be created with this email',
//           err: error.message,
//           success: false
//         })
//       }
//       logger.info(error)
//       return res
//         .status(HTTP_STATUS_CODE.BAD_REQUEST)
//         .json({ error, success: false })
//     }
//     logger.info(error)
//     return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
//       error,
//       message: 'an error occured on creating a user',
//       success: false
//     })
//   }
// }

export const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const findUser = await prisma.users.findUnique({
      where: { email: username },
      include: { wallet: true }
    })
    if (findUser == null) {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ message: 'user not found', success: false })
    }
    const isMatch = await bcrypt.compare(password, findUser.password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'password incorrect', success: false })
    }

    // const userWithoutPassword = exclude(findUser, ["password"]);
    const token = generateToken({
      id: findUser.id,
      email: findUser.email,
      role: findUser.role
    })
    return res.status(200).json({
      message: 'successfully logged in',
      success: true,
      user: { findUser },
      token
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
    logger.info(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on creating a user',
      success: false
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (req.user != null) {
      if (Number(id) !== Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: 'invalid request', success: false })
      }
      await prisma.users.delete({ where: { id: Number(id) } })
      return res
        .status(HTTP_STATUS_CODE.ACCEPTED)
        .json({ message: 'user deleted', success: true })
    }
    return res.status(400).json({ message: 'user not authenticated' })
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
    logger.info(error)
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error,
      message: 'an error occured on creating a user',
      success: false
    })
  }
}

export const confirmWalletNumber = async (req: Request, res: Response) => {
  const { walletId } = req.body

  try {
    const { data } = await axios.get(
      `${config.CHAMS_MOBILE_BASEURL}/transfer/verify-wallet/${walletId}`,
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )
    return res
      .status(200)
      .json({ message: 'wallet validated', success: true, data })
  } catch (error) {
    const err = error as AxiosError
    if (err) {
      logger.info('Err')
      logger.error(err.response?.data)
      return res.status(400).json({ message: err.response?.data })
    }
    logger.info('Error')
    return res.status(400).json({ error })
  }
}

export const getUserByPhone = async (req: Request, res: Response) => {
  const { phone } = req.params

  try {
    const { data } = await axios.get(
      `${config.CHAMS_MOBILE_BASEURL}/user/${phone}`,
      {
        headers: {
          Authorization: `Basic ${config.CHAMS_MOBILE_AUTH}`
        }
      }
    )
    return res
      .status(200)
      .json({ message: 'wallet validated', success: true, data })
  } catch (error) {
    const err = error as AxiosError
    if (err) {
      logger.info('Err')
      logger.error(err.response?.data)
      return res.status(400).json({ message: err.response?.data })
    }
    logger.info('Error')
    return res.status(400).json({ error })
  }
}

export const changePin = async (req: Request, res: Response) => {
  const { pin, newPin } = req.body

  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ message: 'User not Authenticated', success: false })
    }

    const findUser = await prisma.users.findUnique({
      where: { id: req.user.id }
    })

    if (!findUser)
      return res.status(400).json({ message: 'User Not Found', success: false })
    logger.info(JSON.stringify({ check: findUser.pin, pin }))
    if (findUser.pin === Number(pin)) {
      const updatePin = await prisma.users.update({
        where: { id: req.user.id },
        data: { pin: Number(newPin) }
      })

      return res
        .status(200)
        .json({ updatePin, message: 'Pin Updated', success: true })
    } else {
      return res
        .status(400)
        .json({ message: 'Incorrect Pin Submitted', success: false })
    }
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

export const changePassword = async (req: Request, res: Response) => {
  const { password, confirmPassword, newPassword } = req.body

  try {
    if (!req.user) {
      return res
        .status(400)
        .json({ message: 'User not authenticated', success: false })
    }
    logger.info(JSON.stringify({ password, newPassword, confirmPassword }))
    const compare = await bcrypt.compare(password, req.user.password)
    logger.info(compare)
    if (!compare)
      return res
        .status(400)
        .json({ message: 'Incorrect Old Password', success: false })
    if (confirmPassword !== newPassword)
      return res
        .status(400)
        .json({ message: 'Passwords do not Match', success: false })
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.users.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    })
    return res
      .status(200)
      .json({ message: 'Password Changed Successfully', success: true })
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

export const getBalance = async (req: Request, res: Response) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ message: 'user not authenticated', status: false })
  }
  try {
    const findBalance = await prisma.wallet.findUnique({
      where: { user_id: req.user.id }
    })
    if (!findBalance)
      return res
        .status(400)
        .json({ message: 'user does not exist', status: false })
    return res.status(200).json({
      message: 'user gotten',
      status: true,
      balance: findBalance.balance
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
}

export const verifyBvn = async (req: Request, res: Response) => {
  const { firstname, lastname, bvn } = req.body
  if (!req.user) {
    return res
      .status(400)
      .json({ message: 'user not authenticated', status: false })
  }

  try {
    logger.info(JSON.stringify(req.body))

    const findUser = await prisma.users.findUnique({
      where: { id: req.user.id }
    })
    if (findUser) {
      if (findUser.bvnVerified) {
        return res
          .status(200)
          .json({ message: 'user already verified', status: true })
      }
    }

    const { data } = await axios.post(
      'https://api.flutterwave.com/v3/bvn/verifications',
      { bvn, firstname, lastname },
      { headers: { Authorization: `Bearer ${config.flutterwaveSecret}` } }
    )
    const response = data as Bvn
    if (response.data.status === 'success') {
      await prisma.users.update({
        where: { id: req.user.id },
        data: { bvnVerified: true, bvn }
      })
      return res
        .status(200)
        .json({ message: 'bvn verification successful', status: true })
    }
    return res
      .status(400)
      .json({ message: 'verification false', status: false })
  } catch (error) {
    const err = error as AxiosError<flutterWaveCardErrorRespnse>

    if (err) {
      logger.error(err)
      logger.error(err.response?.data)
      await prisma.users.update({
        where: { id: req.user.id },
        data: { bvnVerified: true, bvn }
      })
      if (!err.response?.data.message) {
        return res.status(200).json({ message: 'BVN Verified', status: true })
      }
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
