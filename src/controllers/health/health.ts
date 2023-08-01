import { type Request, type Response } from 'express'

const checkHealth = (req: Request, res: Response) => res.status(200).json({
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'server running',
    timestamp: Date.now()
  })
export default checkHealth
