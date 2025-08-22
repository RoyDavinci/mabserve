import logger from '../common/logger'
import prisma from '../db/prisma'

export class UserController {
  private userId: number

  constructor(userId: number) {
    this.userId = userId
  }

  async checkPin(pin: number) {
    logger.info('[PIN_CHECK] Checking PIN for user', {
      userId: this.userId.toString()
    })

    const findUser = await prisma.users.findUnique({
      where: { id: this.userId }
    })

    if (!findUser) {
      logger.warn('[PIN_CHECK] User not found', {
        userId: this.userId.toString()
      })
      return { status: false, message: 'User does not exist' }
    }

    if (!findUser.pin_auth) {
      logger.warn('[PIN_CHECK] PIN blocked for user', {
        userId: this.userId.toString()
      })
      return { status: false, message: 'Pin Blocked, kindly contact Admin' }
    }

    if (findUser.pin === null || !findUser.pin) {
      logger.warn('[PIN_CHECK] NO PIN for user', {
        userId: this.userId.toString()
      })
      return { status: false, message: 'Kindly generate a pin' }
    }

    if (findUser.pin === pin) {
      logger.info('[PIN_CHECK] PIN validated successfully', {
        userId: this.userId.toString()
      })

      return { status: true, message: 'success' }
    } else {
      // Increment pinTries

      return { status: false, message: 'Incorrect pin' }
    }
  }
}
