import { Request, Response } from 'express'

export const getUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ user: req.user })
  } catch (error) {
    return res.status(400).json({ error })
  }
}

export const get = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: 'welcome' })
  } catch (error) {
    return res.status(400).json({ error })
  }
}
