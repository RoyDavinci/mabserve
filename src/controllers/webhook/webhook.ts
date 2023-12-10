import { type Request, type Response } from 'express'
import logger from '../../common/logger'

export const webhook = async (req: Request, res: Response) => {
  try {
    logger.error(req.params)
    logger.error(req.query)
    return res.status(200).json({ data: req.params, item: req.query })
  } catch (error) {
    return res.status(400).json({ error })
  }
}
