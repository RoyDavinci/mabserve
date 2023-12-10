/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { webhook } from './webhook'

const webHookRouter = Router()

webHookRouter.get('/', webhook)

export default webHookRouter
