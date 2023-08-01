/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { type Users } from '@prisma/client'

declare global {
  namespace Express {
    interface User extends Users {}
  }
}
