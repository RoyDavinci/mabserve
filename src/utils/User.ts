/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable eqeqeq */
// import logger from '../common/logger'
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
    if (getUser.pin != pin) {
      return { status: '400', success: false, message: 'incorrect pin' }
    }
    return { success: true, message: 'authenticated' }
  }

  async checkDailyTransactions(amount: number) {
    try {
      const findUser = await prisma.wallet.findFirst({
        where: { user_id: this.userId }
      })
      if (findUser === null) {
        return { message: 'user not found', status: false }
      }
      const findUsers = await prisma.users.findUnique({
        where: { id: this.userId }
      })
      if (findUsers == null) return { message: 'user not found', status: false }

      if (!findUsers.bvnVerified) {
        if (Number(amount) > 30000) {
          return {
            message:
              'Please Verify Account to do more than 30,000 daily transaction',
            status: false
          }
        }
        if (Number(amount) + Number(findUsers.dailyTransaction) > 30000) {
          return {
            message:
              'Please Verify Account to do more than 30,000 daily transaction',
            status: false
          }
        }
        return { message: 'continue', status: true }
      }
    } catch (error) {
      return { status: false, message: 'an error occured', error }
    }
  }
  async checkKyc() {
    try {
      const findUsers = await prisma.users.findUnique({
        where: { id: this.userId }
      })
      if (findUsers === null) {
        return { message: 'user not found', status: false }
      }
      if (!findUsers.bvnVerified) {
        return { message: 'Please provide BVN to complete KYC', status: false }
      } else {
        return { message: 'User vefiried', status: true }
      }
    } catch (error) {
      return { status: false, message: 'an error occured', error }
    }
  }
}
