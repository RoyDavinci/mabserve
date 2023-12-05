/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import * as controllers from './electricity.controllers'
import { authenticateJWT } from '../../common/authenticate'

const electricityRouter = Router()

electricityRouter.post('/validate', controllers.validateElectricity)
electricityRouter.post(
  '/purchase',
  authenticateJWT,
  controllers.purchaseElectricity
)

export default electricityRouter
