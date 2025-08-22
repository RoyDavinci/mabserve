import { Users } from '@prisma/client'
import logger from '../../common/logger'
import prisma from '../../db/prisma'

export const checkWallet = async (amount: number, user_id: number) => {
  logger.info('[WALLET_CHECK] Checking wallet balance', {
    userId: user_id,
    amount
  })

  const getUser = await prisma.wallet.findUnique({
    where: { user_id: user_id }
  })

  if (!getUser) {
    logger.warn('[WALLET_CHECK] User not found', { userId: user_id })
    return { status: false, message: 'User not found' }
  }

  if (Number(getUser.balance) < amount) {
    logger.warn('[WALLET_CHECK] Insufficient balance', {
      userId: user_id,
      currentBalance: getUser.balance
    })
    return {
      status: false,
      message: 'Insufficient balance to complete transaction'
    }
  }

  logger.info('[WALLET_CHECK] Balance is sufficient', { userId: user_id })
  return { status: true }
}

export const debitUser = async (
  amount: number,
  user_id: number,
  description: string,
  reference: string,
  source: string
) => {
  logger.info('[WALLET_DEBIT] Debiting user', {
    userId: user_id,
    amount,
    reference
  })

  try {
    const [wallet] = await prisma.$transaction(async tx => {
      logger.info('IN HERE')
      const getUser = await tx.wallet.findUnique({
        where: { user_id: user_id }
      })
      if (!getUser) {
        logger.warn('[WALLET_DEBIT] User not found', { userId: user_id })
        throw new Error('User not found')
      }

      if (Number(getUser.balance) < amount) {
        logger.warn('[WALLET_DEBIT] Insufficient balance', {
          userId: user_id,
          currentBalance: getUser.balance,
          attemptedDebit: amount
        })
        throw new Error('Insufficient balance to complete transaction')
      }

      const updatedWallet = await tx.wallet.update({
        where: { user_id: user_id },
        data: { balance: { decrement: amount } }
      })

      await tx.wallet_histories.create({
        data: {
          reference: reference.toString(),
          description,
          amount,
          userId: user_id,
          source,
          type: 'DEBIT',
          balanceAfter: Number(updatedWallet.balance)
        }
      })

      logger.info('[WALLET_DEBIT] Debit successful', {
        userId: user_id,
        balanceAfter: Number(updatedWallet.balance)
      })
      return [updatedWallet]
    })

    return { status: true, message: 'User debited', balance: wallet.balance }
  } catch (error: any) {
    logger.error(
      `[WALLET_DEBIT] Error debiting user  ${JSON.stringify(
        error
      )} ${JSON.stringify(error.message)}`,
      { error: error.nessage, userId: user_id }
    )
    return { status: false, message: 'Failed to debit user' }
  }
}

export const creditUser = async (
  amount: number,
  user_id: number,
  description: string,
  reference: string,
  source: string
) => {
  logger.info('[WALLET_CREDIT] Crediting user', {
    userId: user_id,
    amount,
    reference
  })

  try {
    const [updatedWallet] = await prisma.$transaction(async tx => {
      const getUser = await tx.wallet.findUnique({
        where: { user_id: user_id }
      })
      if (!getUser) {
        logger.warn('[WALLET_CREDIT] User not found', { userId: user_id })
        throw new Error('User not found')
      }

      const updated = await tx.wallet.update({
        where: { user_id: user_id },
        data: { balance: { increment: amount } }
      })

      await tx.wallet_histories.create({
        data: {
          reference,
          description,
          amount,
          userId: user_id,
          source,
          type: 'CREDIT',
          balanceAfter: Number(updated.balance)
        }
      })

      logger.info('[WALLET_CREDIT] Credit successful', {
        userId: user_id,
        balanceAfter: updated.balance
      })
      return [updated]
    })

    return {
      status: true,
      message: 'User credited successfully',
      balance: updatedWallet.balance
    }
  } catch (error) {
    logger.error('[WALLET_CREDIT] Error crediting user', {
      error,
      userId: user_id
    })
    return { status: false, message: 'Failed to credit user' }
  }
}

// export const commissionController = async (
//   user: Users,
//   product: string,
//   network: string | null | undefined,
//   amount: number,
//   reference: string
// ) => {
//   logger.info('[COMMISSION] Starting commission process', {
//     userId: user.id,
//     product,
//     network,
//     amount,
//     reference
//   })

//   try {
//     const getUser = await prisma.users.findUnique({ where: { id: user.id } })

//     if (!getUser) {
//       logger.warn('[COMMISSION] User not found', { userId: user.id })
//       return { message: 'User Commission not gotten', status: false }
//     }

//     const isReferred = !!getUser.referredBy
//     const products = network ? `${network}_${product}` : product

//     const getProducts = await prisma.products.findFirst({
//       where: { name: products }
//     })
//     if (!getProducts) {
//       logger.warn('[COMMISSION] Product not found for commission', {
//         productName: products
//       })
//       return { message: 'Product not avaliable for commission', status: false }
//     }

//     const getValues = await prisma.commissionDetail.findUnique({
//       where: { productId: getProducts.id }
//     })

//     if (!getValues) {
//       logger.warn('[COMMISSION] Commission values not found for product', {
//         productId: getProducts.id
//       })
//       return { message: 'Product not avaliable for commission', status: false }
//     }

//     // Check if commission is active based on startDate and endDate
//     const now = new Date()
//     if (
//       (getValues.startDate && now < getValues.startDate) ||
//       (getValues.endDate && now > getValues.endDate)
//     ) {
//       logger.info('[COMMISSION] Commission inactive due to start/end date', {
//         productId: getProducts.id,
//         startDate: getValues.startDate,
//         endDate: getValues.endDate
//       })
//       return { message: 'Commission period inactive', status: false }
//     }

//     const commissionBonus =
//       parseFloat((amount * Number(getValues.value)).toFixed(1)) / 100
//     const referalValue =
//       parseFloat((amount * Number(getValues.referalValue)).toFixed(1)) / 100

//     if (isReferred) {
//       const referee = await prisma.users.findUnique({
//         where: { id: getUser.referredBy! }
//       })
//       if (!referee) {
//         logger.warn('[COMMISSION] Referee not found', {
//           refereeId: getUser.referredBy
//         })
//         return { message: 'No referee', status: false }
//       }

//       const [commissionedUser, referredUser] = await prisma.$transaction([
//         prisma.wallets.update({
//           where: { userId: getUser.id },
//           data: { commissionBalance: { increment: commissionBonus } }
//         }),
//         prisma.wallets.update({
//           where: { userId: referee.id },
//           data: { referralBonus: { increment: referalValue } }
//         })
//       ])

//       await prisma.$transaction([
//         prisma.wallet_histories.create({
//           data: {
//             amount: commissionBonus,
//             type: 'CREDIT',
//             reference,
//             userId: getUser.id,
//             description: `${product} ${network ?? ''} Commission`,
//             source: 'Davos Commission',
//             balanceAfter: Number(commissionedUser.commissionBalance)
//           }
//         }),
//         prisma.wallet_histories.create({
//           data: {
//             amount: referalValue,
//             type: 'CREDIT',
//             reference,
//             userId: referee.id,
//             description: `${product} ${network ?? ''} Referral Commission`,
//             source: 'Davos Referal Commission',
//             balanceAfter: Number(referredUser.referralBonus)
//           }
//         })
//       ])

//       logger.info(
//         '[COMMISSION] Commission and referral processed successfully',
//         {
//           userId: getUser.id,
//           refereeId: referee.id,
//           commissionBonus,
//           referalValue
//         }
//       )

//       return { message: 'Successful', status: true }
//     } else {
//       const commissionedUser = await prisma.wallets.update({
//         where: { userId: getUser.id },
//         data: { commissionBalance: { increment: commissionBonus } }
//       })

//       await prisma.wallet_histories.create({
//         data: {
//           amount: commissionBonus,
//           type: 'CREDIT',
//           reference,
//           userId: getUser.id,
//           description: `${product} ${network ?? ''} Commission`,
//           source: 'Davos Commission',
//           balanceAfter: Number(commissionedUser.commissionBalance)
//         }
//       })

//       logger.info(
//         '[COMMISSION] Commission processed successfully (no referee)',
//         {
//           userId: getUser.id,
//           commissionBonus
//         }
//       )

//       return { message: 'successful', status: true }
//     }
//   } catch (error) {
//     logger.error('[COMMISSION] Error processing commission', {
//       error,
//       userId: user.id
//     })
//     return { status: false, message: 'Failed to give commission to user' }
//   }
// }
