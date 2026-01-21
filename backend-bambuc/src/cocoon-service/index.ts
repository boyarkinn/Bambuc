import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { cocoonRouter } from './routes.js'
import { config } from './config.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use(cocoonRouter)

app.listen(config.port, () => {
  console.log(`[cocoon-service] listening on ${config.port}`)
})
