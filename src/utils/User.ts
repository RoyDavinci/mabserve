/* eslint-disable eqeqeq */
import logger from '../common/logger'
import prisma from '../db/prisma'

export class User {
  constructor(
    public userId: number // public
  ) {
    this.userId = userId
    // this.pin = pin
  }

  async checkPin(pin?: number) {
    const getUser = await prisma.users.findUnique({
      where: { id: this.userId }
    })

    if (getUser == null) {
      return { status: '400', success: false, message: 'user not found' }
    }
    logger.info(getUser.pin)
    logger.info(pin)
    if (getUser.pin != pin) {
      return { status: '400', success: false, message: 'incorrect pin' }
    }
    return { success: true, message: 'authenticated' }
  }
}
