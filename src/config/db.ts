import Joi from 'joi'
import dotenv from 'dotenv-safe'

dotenv.config()

const envSchema = Joi.object({
  DATABASE_URL: Joi.string().required()
}).unknown()

const { value: envVars, error } = envSchema.validate(process.env)
if (error != null) {
  throw new Error(`Config validation error: ${error.message}`)
}

const dbConfig = {
  DATABASE_URL: envVars.DATABASE_URL
}

export default dbConfig
