import { Router } from 'express'
import axios from 'axios'
import { GoogleAuth } from 'google-auth-library'

const router = Router()

const getProjectId = () => {
  const projectId = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
  if (!projectId) {
    throw new Error('VERTEX_PROJECT_ID is not set')
  }
  return projectId
}

const getLocation = () => process.env.VERTEX_LOCATION || 'us-central1'
const getModel = () => process.env.VEO_MODEL_ID || 'veo-3.1-generate-001'

const getTimeoutMs = () => {
  const value = Number(process.env.VEO_TIMEOUT_MS)
  return Number.isFinite(value) && value > 0 ? value : 180000
}

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y', 'on'].includes(value.toLowerCase())
  }
  return fallback
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

router.post('/videos/generate', async (req, res) => {
  try {
    const {
      prompt,
      durationSeconds,
      aspectRatio,
      resolution,
      sampleCount,
      negativePrompt,
      seed,
      generateAudio,
      storageUri,
      personGeneration
    } = req.body ?? {}

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' })
    }

    if (durationSeconds && ![4, 6, 8].includes(Number(durationSeconds))) {
      return res.status(400).json({ error: 'durationSeconds must be 4, 6, or 8' })
    }

    if (aspectRatio && !['16:9', '9:16'].includes(String(aspectRatio))) {
      return res.status(400).json({ error: 'aspectRatio must be 16:9 or 9:16' })
    }

    if (resolution && !['720p', '1080p', '4k'].includes(String(resolution))) {
      return res.status(400).json({ error: 'resolution must be 720p, 1080p, or 4k' })
    }

    if (sampleCount && (Number(sampleCount) < 1 || Number(sampleCount) > 4)) {
      return res.status(400).json({ error: 'sampleCount must be between 1 and 4' })
    }

    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })
    const client = await auth.getClient()
    const tokenResponse = await client.getAccessToken()
    const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token

    if (!accessToken) {
      throw new Error('Failed to obtain access token')
    }

    const projectId = getProjectId()
    const location = getLocation()
    const modelId = getModel()
    const baseUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}`
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    }

    const parameters: Record<string, unknown> = {
      durationSeconds: Number(durationSeconds) || 8,
      aspectRatio: aspectRatio ?? '16:9',
      resolution: resolution ?? '720p',
      sampleCount: Number(sampleCount) || 1,
      generateAudio: parseBoolean(generateAudio, true)
    }

    if (negativePrompt) {
      parameters.negativePrompt = String(negativePrompt)
    }
    if (seed !== undefined && seed !== null && seed !== '') {
      parameters.seed = Number(seed)
    }
    if (personGeneration) {
      parameters.personGeneration = String(personGeneration)
    }

    const effectiveStorageUri = storageUri ?? process.env.VEO_OUTPUT_GCS_URI
    if (effectiveStorageUri) {
      parameters.storageUri = String(effectiveStorageUri)
    }

    const { data: startResponse } = await axios.post(
      `${baseUrl}:predictLongRunning`,
      {
        instances: [{ prompt: String(prompt) }],
        parameters
      },
      { headers }
    )

    const operationName = startResponse?.name
    if (!operationName) {
      return res.status(502).json({ error: 'no operation returned' })
    }

    const deadline = Date.now() + getTimeoutMs()
    let lastResponse: any

    while (Date.now() < deadline) {
      const { data } = await axios.post(
        `${baseUrl}:fetchPredictOperation`,
        { operationName },
        { headers }
      )
      lastResponse = data

      if (data?.done) {
        if (data?.error) {
          return res.status(502).json({ error: data.error.message ?? 'video generation failed' })
        }
        break
      }

      await sleep(2000)
    }

    if (!lastResponse?.done) {
      return res.status(504).json({ error: 'video generation timeout' })
    }

    const videos = lastResponse?.response?.videos ?? []
    const video = videos[0]
    if (!video) {
      return res.status(502).json({ error: 'no video data returned' })
    }

    return res.json({
      mimeType: video?.mimeType ?? 'video/mp4',
      data: video?.bytesBase64Encoded,
      gcsUri: video?.gcsUri
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data
      console.error('[videos.generate] axios error', {
        status,
        data
      })
      return res.status(502).json({
        error: 'video provider error',
        providerStatus: status,
        providerError: data
      })
    }

    console.error('[videos.generate] error', error)
    return res.status(500).json({ error: 'internal server error' })
  }
})

export const videosRouter = router
