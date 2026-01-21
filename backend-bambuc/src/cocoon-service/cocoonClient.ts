import axios, { type AxiosInstance } from 'axios'
import { config } from './config.js'

class CocoonClient {
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: config.cocoonBaseUrl,
      timeout: config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  async listModels() {
    const { data } = await this.http.get('/v1/models')
    return data
  }

  async chatCompletions(payload: Record<string, unknown>) {
    const { data } = await this.http.post('/v1/chat/completions', payload)
    return data
  }

  async completions(payload: Record<string, unknown>) {
    const { data } = await this.http.post('/v1/completions', payload)
    return data
  }
}

export const cocoonClient = new CocoonClient()
