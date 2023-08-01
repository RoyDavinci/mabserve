import PassportJwt from 'passport-jwt'
import { PassportStatic } from 'passport'
import bcrypt from 'bcryptjs'
import prisma from '../db/prisma'
import PassportLocal from 'passport-local'

const options = {
  jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
}

export const PassportService = (passport: PassportStatic) => {
  passport.use(
    new PassportJwt.Strategy(options, async (payload, done) => {
      const user = await prisma.users.findUnique({
        where: { id: Number(payload.id) },
      })
      if (!user) return done(null, false, { message: "user doesn't  exist" })
      return done(null, user, { message: 'user authenticated' })
    }),
  ),
    passport.use(
      new PassportLocal.Strategy(async function (username, password, done) {
        try {
          const user = await prisma.users.findFirst({
            where: { email: username },
          })
          if (!user) {
            return done(null, false, {
              message: `${username} is not a registered account`,
            })
          }
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch)
            return done(null, false, {
              message: 'password is incorrect',
            })
          if (user.accountStatus === 123456789) {
            return done(null, false, {
              message: 'user has been blacklisted',
            })
          }
          return done(null, user, { message: 'authenticated successfully' })
        } catch (error) {
          return done(error, false, {
            message: 'Error processing your info',
          })
        }
      }),
    )

  passport.serializeUser((user, done) => {
    const { id } = user
    done(null, id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { id: Number(id) },
      })

      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  })
}
