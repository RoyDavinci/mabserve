// import { Router } from 'express'
// import { authenticateJWT } from '../common/authenticate'
// import { get } from '../controllers/auth'
// import { getUser } from '../controllers/auth/auth.controllers'

// const authRouter = Router()
// authRouter.get('/', get)
// authRouter.post('/check/:id', authenticateJWT, getUser)

// export default authRouter

import { Router } from 'express'
import authRouter from '../controllers/auth/auth.service'

const apiV1Router = Router()

apiV1Router.use('/auth', authRouter)

export default apiV1Router
