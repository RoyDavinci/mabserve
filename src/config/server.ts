/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import Joi from 'joi'
import dotenv from 'dotenv-safe'

dotenv.config()

const envSchema = Joi.object({
  NODE_ENV: Joi.string().allow('development', 'test', 'production'),
  PORT: Joi.string().required(),
  SECRET: Joi.string().required(),
  CHAMS_MOBILE_BASEURL: Joi.string().required(),
  CHAMS_MOBILE_USERNAME: Joi.string().required(),
  CHAMS_MOBILE_PASSWORD: Joi.string().required(),
  CHAMS_MOBILE_AUTH: Joi.string().required()
}).unknown()

const { error, value: envVars } = envSchema.validate(process.env)
if (error != null) {
  throw new Error(`Config validation error: ${error.message}`)
}

const serverConfig = {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  server: {
    port: envVars.PORT || '3900',
    secret: envVars.SECRET,
    tokenExpirationTime: envVars.TOKENEXPIRATIONTIME
  },
  CHAMS_MOBILE_BASEURL: envVars.CHAMS_MOBILE_BASEURL,
  CHAMS_MOBILE_USERNAME: envVars.CHAMS_MOBILE_USERNAME,
  CHAMS_MOBILE_PASSWORD: envVars.CHAMS_MOBILE_PASSWORD,
  CHAMS_MOBILE_AUTH: envVars.CHAMS_MOBILE_AUTH
}
export default serverConfig
