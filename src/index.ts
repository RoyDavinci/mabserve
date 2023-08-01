import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import passport from 'passport'
import { PassportService } from './common/passport'
import authRouter from './routes/routes'
import sessionInstance from './common/session'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(sessionInstance)
PassportService(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use('/api', authRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
