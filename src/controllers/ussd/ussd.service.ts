/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import * as controllers from "./ussd.controllers"

const ussdRouter = Router()


ussdRouter.get("/start", controllers.begin)

export default ussdRouter