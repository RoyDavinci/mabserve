/* eslint-disable @typescript-eslint/no-empty-interface */
import { Users } from '@prisma/client'

declare global {
  namespace Express {
    interface User extends Users {}
  }
}
