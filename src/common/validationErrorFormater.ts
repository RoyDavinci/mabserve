import { type ValidationError } from 'express-validator'

const validatorErrorFormater = (initialErrorFormat: ValidationError[]) =>
  initialErrorFormat.map(errorObj => errorObj.msg)
export default validatorErrorFormater
