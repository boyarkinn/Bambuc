import { useState } from 'react'
import ChatSidebar from '../Chat/ChatSidebar'
import ImageCard from './ImageCard'
import '../Chat/Chat.css'
import './Images.css'

type GeneratedImage = {
  id: string
  src: string
  prompt: string
  mimeType: string
}

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function Images() {
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setActiveImage(null)

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Введите текст запроса')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/v1/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt })
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      if (!response.ok) {
        setError(data?.error ?? 'Не удалось создать изображение')
        return
      }

      if (!data?.data) {
        setError('Изображение не вернулось')
        return
      }

      const mimeType = data?.mimeType ?? 'image/png'
      const src = `data:${mimeType};base64,${data.data}`
      const nextImage: GeneratedImage = {
        id: createId(),
        src,
        prompt: trimmedPrompt,
        mimeType
      }
      setImages((prev) => [...prev, nextImage])
    } catch (err) {
      console.error('[images.generate] failed', err)
      setError('Ошибка соединения с сервером')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="chat bg-dark images">
      <div className="chat__layout">
        <ChatSidebar showNewChat />

        <section className="chat__main">
          <header className="chat__header">
            <div className="chat__title">Генерация изображений</div>
          </header>

          <section className="chat__window images__window">
            {images.length > 0 ? (
              <div className="images__grid">
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    src={image.src}
                    prompt={image.prompt}
                    onOpen={() => setActiveImage(image)}
                    onDownload={() => {
                      const link = document.createElement('a')
                      link.href = image.src
                      link.download = `bambuc-image-${image.id}.${image.mimeType.includes('png') ? 'png' : 'jpg'}`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="images__placeholder">Здесь появятся результаты</div>
            )}
            {error && <div className="chat__error">{error}</div>}
          </section>

          <form className="chat__composer images__composer" onSubmit={handleSubmit}>
            <textarea
              className="chat__input images__input"
              rows={3}
              placeholder="Опиши изображение..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={isGenerating}
            />
            <button className="btn btn-primary" type="submit" disabled={isGenerating}>
              {isGenerating ? 'Генерация...' : 'Создать'}
            </button>
          </form>
        </section>
      </div>

      {activeImage && (
        <div className="images__overlay" onClick={() => setActiveImage(null)}>
          <div className="images__overlay-body" onClick={(event) => event.stopPropagation()}>
            <button
              className="images__overlay-close"
              type="button"
              onClick={() => setActiveImage(null)}
              aria-label="Закрыть"
            >
              <svg
                className="images__overlay-close-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <img className="images__overlay-image" src={activeImage.src} alt={activeImage.prompt} />
          </div>
        </div>
      )}
    </main>
  )
}

export default Images
