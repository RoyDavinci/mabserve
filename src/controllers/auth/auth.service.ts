/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import * as controllers from './auth.controllers'
import * as middleware from './auth.middlewares'
import { authenticateJWT, authenticateLocal } from '../../common/authenticate'

const authRouter = Router()

authRouter.get('/', controllers.getAllUsers)
authRouter.get('/kegowUsers', controllers.getUsersFromKegow)
authRouter.get('/get-balance', authenticateJWT, controllers.getBalance)
authRouter.get('/:phone', controllers.getUserByPhone)
authRouter.get('/:id', authenticateJWT, controllers.getUser)

authRouter.post('/walletId', controllers.confirmWalletNumber)
authRouter.post(
  '/create',
  middleware.validateSignupData,
  controllers.createUser
)

authRouter.patch('/pin', authenticateJWT, controllers.createPin)
authRouter.post('/login', authenticateLocal, controllers.signIn)
authRouter.delete('/delete-user/:id', authenticateJWT, controllers.deleteUser)
authRouter.patch('/change-pin/', authenticateJWT, controllers.changePin)
authRouter.patch(
  '/change-password/',
  authenticateJWT,
  controllers.changePassword
)
authRouter.post(
  '/bvn',
  authenticateJWT,
  middleware.validateBVn,
  controllers.verifyBvn
)

authRouter.post('/verify-phone', authenticateJWT, controllers.veryfophoneNumber)
authRouter.post(
  '/verify-phone-otp',
  authenticateJWT,
  controllers.verifyPhoneOtp
)
authRouter.post('/verify-bvn-nin', authenticateJWT, controllers.bvnValidation)

export default authRouter
