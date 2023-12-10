import { type Request, type Response } from 'express'

export const webhook = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ data: req.params, item: req.query })
  } catch (error) {}
}
