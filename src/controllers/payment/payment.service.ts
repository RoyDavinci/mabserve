/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import * as controllers from "./payment.controllers"


const paymentRouter = Router()

paymentRouter.get("/banks", controllers.getBanks)
paymentRouter.post("/initialize", controllers.initiatePaymentToBank)


export default paymentRouter