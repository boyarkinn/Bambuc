import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './db/index.js'
import { authRouter } from './auth/routes.js'
import { imagesRouter } from './images/routes.js'
import { videosRouter } from './videos/routes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRouter)
app.use('/v1', imagesRouter)
app.use('/v1', videosRouter)

const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 5051

async function start() {
  await connectDb()
  app.listen(port, () => {
    console.log(`[backend] listening on ${port}`)
  })
}

start().catch((error) => {
  console.error('[backend] failed to start', error)
  process.exit(1)
})
