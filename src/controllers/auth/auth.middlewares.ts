import { check } from 'express-validator'
import validationErrorHandler from '../../common/validationErrorHandler'

export const validateSignupData = [
  check('first_name')
    .stripLow()
    .optional({ nullable: false, checkFalsy: true })
    .bail()
    .isString()
    .withMessage('invalid firstname format')
    .bail(),
  check('last_name')
    .stripLow()
    .optional({ nullable: false, checkFalsy: true })
    .bail()
    .isString()
    .withMessage('invalid lastname')
    .bail(),
  check('email')
    .notEmpty()
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('invalid email format')
    .trim(),
  check('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 4, max: 50 })
    .withMessage('min: 4, max:50 password character'),
  validationErrorHandler
]

export const getUserValidation = []

export const validateBVn = [
  check('firstname')
    .notEmpty()
    .withMessage('firstname is required')
    .bail()
    .trim(),
  check('lastname')
    .notEmpty()
    .withMessage('lastname is required')
    .bail()
    .trim(),
  check('bvn').notEmpty().withMessage('bvn is required').bail().trim(),
  validationErrorHandler
]
