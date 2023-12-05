/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import Joi from 'joi'
import dotenv from 'dotenv-safe'

dotenv.config()

const envSchema = Joi.object({
  FLUTTERWAVE_PUBLICKEY: Joi.string().required(),
  FLUTTERWAVE_SECRETKEY: Joi.string().required(),
  FLUTTERWAVE_ENCRYPTION: Joi.string().required(),
  RINGO_EMAIL: Joi.string().required(),
  RINGO_PASSWORD: Joi.string().required()
}).unknown()

const { error, value: envVars } = envSchema.validate(process.env)
if (error != null) {
  throw new Error(`Config validation error: ${error.message}`)
}

const paymentConfig = {
  flutterwavePublicKey: envVars.FLUTTERWAVE_PUBLICKEY,
  flutterwaveSecret: envVars.FLUTTERWAVE_SECRETKEY,
  flutterWaveEncryption: envVars.FLUTTERWAVE_ENCRYPTION,
  ringoEmail: envVars.RINGO_EMAIL,
  ringoPassword: envVars.RINGO_PASSWORD
}
export default paymentConfig
