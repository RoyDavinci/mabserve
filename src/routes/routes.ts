
import { Router } from 'express'
import authRouter from '../controllers/auth/auth.service'
import ussdRouter from '../controllers/ussd/ussd.service'
import paymentRouter from '../controllers/payment/payment.service'

const apiV1Router = Router()

apiV1Router.use('/auth', authRouter)
apiV1Router.use("/ussd", ussdRouter)
apiV1Router.use("/payment", paymentRouter)

export default apiV1Router
