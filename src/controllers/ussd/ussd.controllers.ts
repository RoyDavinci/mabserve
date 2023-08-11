import { type Request, type Response } from "express";
import logger from "../../common/logger";

export const begin = async (req: Request, res: Response) =>  {

    const {text, sessionId, serviceCode, phoneNumber} = req.body

    let string = ``;

    if(text === ''){
        
    string = `CON Welcome to My Airbank \n
    
                    1. Balance Enquiry. \n
                    2. Account Statement. \n
                    3. Transfer. \n
                    4. Pay Bills \n
                    5. Deposit \n
                    6. Exit
    
    `;
    }
    else{
    
        string = 'welcome'
    }

    logger.info(req)
    logger.info(phoneNumber)
    logger.info(serviceCode)
    logger.info(sessionId)
    res.set('Content-Type: text/plain');
    return res.status(200).send(string)

}