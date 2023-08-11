/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import * as controllers from './auth.controllers'
import * as middleware from './auth.middlewares'
import { authenticateJWT, authenticateLocal } from '../../common/authenticate'

const authRouter = Router()

authRouter.get('/', controllers.getAllUsers)
authRouter.get('/:id', authenticateJWT, controllers.getUser)

authRouter.post(
  '/create',
  middleware.validateSignupData,
  controllers.createUser
)
authRouter.patch("/pin", authenticateJWT, controllers.createPin)
authRouter.post('/login', authenticateLocal, controllers.signIn)
authRouter.delete('/delete-user/:id', authenticateJWT, controllers.deleteUser)
authRouter.patch('/update-user/:id', authenticateJWT, controllers.editUserInfo)

export default authRouter
