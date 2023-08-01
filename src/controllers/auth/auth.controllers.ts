/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import bcrypt from 'bcryptjs'
/* eslint-disable camelcase */
import { type Request, type Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../../db/prisma'
import HTTP_STATUS_CODE from '../../constants/httpCode'
import logger from '../../common/logger'
import {
  generateRandomNewNumber,
  generateRandomNumber
} from '../../common/generateRandomNumberr'
import generateToken from '../../common/generateToken'

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

export const createUser = async (req: Request, res: Response) => {
  const { email, first_name, last_name, password, phone } = req.body

  try {
    const findUser = await prisma.users.findUnique({ where: { email } })
    if (findUser != null) {
      return res
        .status(400)
        .json({ message: 'user already exists', success: false })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.users.create({
      data: { email, password: hashedPassword, last_name, first_name, phone }
    })
    const walletCode = generateRandomNumber()
    const findWalletCode = await prisma.wallet.findUnique({
      where: { code: walletCode }
    })
    if (findWalletCode != null) {
      await prisma.wallet.create({
        data: { code: generateRandomNewNumber(), user_id: newUser.id }
      })
    } else {
      await prisma.wallet.create({
        data: { code: walletCode, user_id: newUser.id }
      })
    }
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    })
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      message: 'user created',
      success: true,
      user: { newUser },
      token
    })
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

export const editUserInfo = async (req: Request, res: Response) => {
  const { email, password, first_name, last_name, phone } = req.body
  const { id } = req.params

  try {
    if (req.user != null) {
      if (Number(id) !== Number(req.user.id)) {
        return res
          .status(400)
          .json({ message: 'invalid request', success: false })
      }
      const findUser = await prisma.users.findUnique({
        where: { id: Number(id) }
      })

      if (findUser == null) {
        return res
          .status(HTTP_STATUS_CODE.BAD_REQUEST)
          .json({ message: 'user does exist', succes: false })
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatedUser = await prisma.users.update({
          where: { id: Number(id) },
          data: {
            email,
            password: hashedPassword,
            first_name,
            last_name,
            phone
          }
        })
        return res.status(HTTP_STATUS_CODE.ACCEPTED).json({
          message: 'user updated',
          success: true,
          user: { updatedUser }
        })
      }
      const updatedUser = await prisma.users.update({
        where: { id: Number(id) },
        data: { email, first_name, last_name, phone }
      })
      return res.status(HTTP_STATUS_CODE.ACCEPTED).json({
        message: 'user updated',
        success: true,
        user: { updatedUser }
      })
    }
    return res.status(400).json({ message: 'user not authenticated' })
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

export const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const findUser = await prisma.users.findUnique({
      where: { email: username }
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
    return res
      .status(200)
      .json({ message: 'successfully logged in', user: { findUser }, token })
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
        .json({ message: 'user deleted' })
    }
    return res.status(400).json({ message: 'user not authenticated' })
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
