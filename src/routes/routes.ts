import { Router } from 'express'
import authRouter from '../controllers/auth/auth.service'
import ussdRouter from '../controllers/ussd/ussd.service'
import paymentRouter from '../controllers/payment/payment.service'
import airtimeRouter from '../controllers/airtime/airtime.service'
import electricityRouter from '../controllers/electricity/electricity.service'

const apiV1Router = Router()

apiV1Router.use('/auth', authRouter)
apiV1Router.use('/ussd', ussdRouter)
apiV1Router.use('/payment', paymentRouter)
apiV1Router.use('/airtime', airtimeRouter)
apiV1Router.use('/electricity', electricityRouter)

export default apiV1Router
