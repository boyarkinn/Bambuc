import express, { type Request, type Response, type NextFunction } from 'express'
import axios from 'axios'
import { cocoonClient } from './cocoonClient.js'

export const cocoonRouter = express.Router()

cocoonRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'cocoon' })
})

cocoonRouter.get('/v1/models', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cocoonClient.listModels()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

cocoonRouter.post('/v1/chat/completions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cocoonClient.chatCompletions(req.body ?? {})
    res.json(data)
  } catch (error) {
    next(error)
  }
})

cocoonRouter.post('/v1/completions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await cocoonClient.completions(req.body ?? {})
    res.json(data)
  } catch (error) {
    next(error)
  }
})

cocoonRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502
    res.status(status).json(error.response?.data ?? { error: 'Cocoon request failed' })
    return
  }

  res.status(500).json({ error: 'Unexpected error' })
})
