/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable camelcase */
import prisma from '../db/prisma'

export class WalletController {
  constructor(
    public narration: string,
    public amount: number,
    public type: string,
    public user_id: number
  ) {
    this.narration = narration
    this.amount = amount
    this.type = type
  }

  async debit() {
    try {
      const findUser = await prisma.wallet.findFirst({
        where: { user_id: this.user_id }
      })
      if (findUser === null) {
        return { message: 'user not found', status: false }
      }
      if (Number(findUser.balance) - this.amount <= 0) {
        return { status: false, message: 'insufficient balance' }
      }

      await prisma.wallet.update({
        where: { user_id: this.user_id },
        data: {
          name: this.narration,
          balance: { decrement: Number(this.amount) }
        }
      })
      return { status: true, message: 'successfully debited' }
    } catch (error) {
      return { status: false, message: 'insufficient balance', error }
    }
  }

  async checkBalance() {
    try {
      const findUser = await prisma.wallet.findFirst({
        where: { user_id: this.user_id }
      })
      if (findUser === null) {
        return { message: 'user not found', status: false }
      }

      if (Number(findUser.balance) < this.amount) {
        return { message: 'insufficient balance', status: false }
      } else {
        return { message: 'success', status: true }
      }
    } catch (error) {
      return { status: false, message: 'error happened', error }
    }
  }

  async credit() {
    try {
      const findUser = await prisma.wallet.findFirst({
        where: { user_id: this.user_id }
      })
      if (findUser === null) {
        return { message: 'user not found', status: false }
      }
      if (this.amount <= 0) {
        return { status: false, message: 'nothing to do with balance' }
      }

      await prisma.wallet.update({
        where: { user_id: this.user_id },
        data: {
          name: this.narration,
          balance: { increment: Number(this.amount) }
        }
      })
      return { status: true, message: 'successfully debited' }
    } catch (error) {
      return { status: false, message: 'insufficient balance', error }
    }
  }
}
