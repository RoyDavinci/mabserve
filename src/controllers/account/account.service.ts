import { Router } from 'express'
import { authenticateJWT } from '../../common/authenticate'
import * as controllers from './account.controllers'

const accountRouter = Router()

accountRouter.post(
  '/virtual-account',
  authenticateJWT,
  controllers.createVirtualAccount
)
accountRouter.get('/banks', controllers.getAllBanks)
accountRouter.post('/payout', authenticateJWT, controllers.initiatePayout)
accountRouter.post('/account', authenticateJWT, controllers.getAccountdetails)

export default accountRouter
