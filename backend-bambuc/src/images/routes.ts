import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'

const router = Router()

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set')
  }
  return key
}

const getModel = () => process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview'

router.post('/images/generate', async (req, res) => {
  try {
    const { prompt } = req.body ?? {}

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() })
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })

    const candidates = response?.candidates ?? []
    const parts = (candidates[0]?.content?.parts ?? []) as Array<{
      inlineData?: { data?: string; mimeType?: string }
      inline_data?: { data?: string; mime_type?: string }
    }>
    const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data)

    if (!imagePart) {
      return res.status(502).json({ error: 'no image data returned' })
    }

    const inlineData = (imagePart.inlineData ?? imagePart.inline_data) as
      | { data?: string; mimeType?: string; mime_type?: string }
      | undefined
    return res.json({
      mimeType: inlineData?.mimeType ?? inlineData?.mime_type ?? 'image/png',
      data: inlineData?.data
    })
  } catch (error) {
    console.error('[images.generate] error', error)
    return res.status(500).json({ error: 'internal server error' })
  }
})

export const imagesRouter = router
