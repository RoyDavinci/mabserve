/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { authenticateJWT } from '../../common/authenticate'
import * as controllers from './AirtimeControllers'
const airtimeRouter = Router()

airtimeRouter.post(
  '/purchase-airtime',
  authenticateJWT,
  controllers.purchaseAirtime
)
airtimeRouter.post('/add-bundles', controllers.insertData)
airtimeRouter.post('/purchase-data', authenticateJWT, controllers.purchaseData)
airtimeRouter.get('/get-plans/:network', controllers.getDataPlans)

export default airtimeRouter
