/* eslint-disable @typescript-eslint/restrict-template-expressions */
import express, { type Request, type Response } from 'express'
import dotenv from 'dotenv'
import passport from 'passport'
import { PassportService } from './common/passport'
import authRouter from './routes/routes'
import sessionInstance from './common/session'
import logger from './common/logger'

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(sessionInstance)
PassportService(passport)
app.use(passport.initialize())
app.use(passport.session())
app.get("/", (req: Request, res: Response) => res.status(200).json({message:"welcome"}))
app.use('/api', authRouter)

app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`)
})
