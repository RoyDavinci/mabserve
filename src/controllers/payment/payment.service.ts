/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import * as controllers from './payment.controllers'
import { authenticateJWT } from '../../common/authenticate'

const paymentRouter = Router()

paymentRouter.get('/banks', controllers.getBanks)
paymentRouter.post(
  '/initialize',
  authenticateJWT,
  controllers.initiatePaymentToBank
)
paymentRouter.post('/airbank', authenticateJWT, controllers.transferToAirbank)

export default paymentRouter
