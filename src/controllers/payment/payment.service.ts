/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import * as controllers from './payment.controllers'
import { authenticateJWT } from '../../common/authenticate'

const paymentRouter = Router()

paymentRouter.get('/banks', controllers.getBanks)
// paymentRouter.get(
//   '/transfer/fundWallet',
//   authenticateJWT,
//   controllers.fundUserWallet
// )
paymentRouter.get('/verify/:id', controllers.verifyFlutterWavePayment)
paymentRouter.post(
  '/initialize',
  authenticateJWT,
  controllers.initiatePaymentToBank
)
paymentRouter.post(
  '/kegowPayment',
  authenticateJWT,
  controllers.kegowBankPayment
)
paymentRouter.post('/airbank', authenticateJWT, controllers.transferToAirbank)

paymentRouter.post('/transfer', authenticateJWT, controllers.fundWallet)

paymentRouter.post(
  '/card-charge',
  authenticateJWT,
  controllers.fundWalletViaCard
)

paymentRouter.post('/test', controllers.testBankTransfer)
paymentRouter.post('/testing', controllers.testMomo)

export default paymentRouter
