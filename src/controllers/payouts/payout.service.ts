import { Router } from 'express'
import * as controllers from './payout.controllers'
import { authenticateJWT } from '../../common/authenticate'
const payoutRouter = Router()

payoutRouter.get('/payout/banks', controllers.getAllBanks)
payoutRouter.post('/payout/account', controllers.getAccountdetails)
payoutRouter.post(
  '/payout/payment',
  authenticateJWT,
  controllers.initiatePayout
)

export default payoutRouter
