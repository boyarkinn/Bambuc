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

const parseDataUrl = (value: string) => {
  const match = value.match(/^data:(.+?);base64,(.+)$/)
  if (!match) {
    return null
  }
  const [, mimeType, data] = match
  if (!mimeType || !data) {
    return null
  }
  return { mimeType, data }
}

router.post('/images/generate', async (req, res) => {
  try {
    const { prompt, images } = req.body ?? {}

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const imageList = Array.isArray(images) ? images : images ? [images] : []
    if (imageList.length > 3) {
      return res.status(400).json({ error: 'images limit is 3' })
    }

    let validImageCount = 0
    const imageMimeTypes: string[] = []
    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = []
    imageList.forEach((image) => {
      if (typeof image !== 'string') {
        return
      }
      const parsed = parseDataUrl(image)
      if (!parsed) {
        return
      }
      validImageCount += 1
      imageMimeTypes.push(parsed.mimeType)
      parts.push({ inlineData: { data: parsed.data, mimeType: parsed.mimeType } })
    })
    if (imageList.length > 0 && validImageCount === 0) {
      return res.status(400).json({ error: 'images must be data URLs' })
    }
    parts.push({ text: prompt })

    console.log('[images.generate] input images', {
      count: validImageCount,
      mimeTypes: imageMimeTypes
    })

    const ai = new GoogleGenAI({ apiKey: getApiKey() })
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: [{ role: 'user', parts }]
    })

    const candidates = response?.candidates ?? []
    const responseParts = (candidates[0]?.content?.parts ?? []) as Array<{
      inlineData?: { data?: string; mimeType?: string }
      inline_data?: { data?: string; mime_type?: string }
    }>
    const imagePart = responseParts.find((part) => part.inlineData?.data || part.inline_data?.data)

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
