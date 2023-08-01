/* eslint-disable import/extensions */
import session from 'express-session'
import config from '../config'

const sessionInstance = session({
  secret: [config.server.secret],
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
})

export default sessionInstance
