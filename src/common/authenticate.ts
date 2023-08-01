import { NextFunction, Request, Response } from 'express'
import STATUS_CODES from '../constants/httpCode'
import passport from 'passport'

export const authenticateLocal = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return passport.authenticate(
      'local',
      (error: Error, user: Express.User, info: { message: string }) => {
        if (error)
          return res
            .status(400)
            .json({ message: info.message, error: error.message })

        if (!user) {
          return res.status(400).json({ message: info.message })
        }

        return req.logIn(user, err => {
          if (err)
            return res
              .status(400)
              .json({ message: info.message, error: err.message })

          return next()
        })
      },
    )(req, res, next)
  } catch (error) {
    return res
      .status(STATUS_CODES.NOT_ACCEPTABLE)
      .json({ message: 'wrong username/password', error })
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.headers.authorization) {
    return res.status(400).json({ message: 'header token needed' })
  }
  try {
    return passport.authenticate(
      'jwt',
      { session: false },
      (error: Error, user: Express.User) => {
        if (error) {
          return res.status(403).json({ message: error.message })
        }

        if (!user) {
          return res.status(404).json({ message: 'user does not exist' })
        }

        return req.logIn(user, err => {
          if (err) {
            console.log(err)
            return res.status(403).json({ message: err.message })
          }

          return next()
        })
      },
    )(req, res, next)
  } catch (error) {
    return res.status(402).json({ message: 'user not found', error })
  }
}
