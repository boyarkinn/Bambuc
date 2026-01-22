import { useState } from 'react'
import ChatSidebar from '../Chat/ChatSidebar'
import VideoCard from './VideoCard'
import '../Chat/Chat.css'
import './Videos.css'

type GeneratedVideo = {
  id: string
  src?: string
  prompt: string
  mimeType: string
  gcsUri?: string
}

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function Videos() {
  const [prompt, setPrompt] = useState('')
  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [activeVideo, setActiveVideo] = useState<GeneratedVideo | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setActiveVideo(null)

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Введите текст запроса')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/v1/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt })
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      if (!response.ok) {
        setError(data?.error ?? 'Не удалось создать видео')
        return
      }

      const mimeType = data?.mimeType ?? 'video/mp4'
      const source = data?.data ? `data:${mimeType};base64,${data.data}` : undefined
      const gcsUri = data?.gcsUri ? String(data.gcsUri) : undefined

      if (!source && !gcsUri) {
        setError('Видео не вернулось')
        return
      }

      const nextVideo: GeneratedVideo = {
        id: createId(),
        src: source,
        prompt: trimmedPrompt,
        mimeType,
        gcsUri
      }
      setVideos((prev) => [...prev, nextVideo])
    } catch (err) {
      console.error('[videos.generate] failed', err)
      setError('Ошибка соединения с сервером')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="chat bg-dark videos">
      <div className="chat__layout">
        <ChatSidebar showNewChat={false} />

        <section className="chat__main">
          <header className="chat__header">
            <div className="chat__title">Генерация видео</div>
          </header>

          <section className="chat__window videos__window">
            {videos.length > 0 ? (
              <div className="videos__grid">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    src={video.src}
                    prompt={video.prompt}
                    gcsUri={video.gcsUri}
                    onOpen={() => setActiveVideo(video)}
                    onDownload={() => {
                      if (!video.src) {
                        return
                      }
                      const link = document.createElement('a')
                      link.href = video.src
                      link.download = `bambuc-video-${video.id}.mp4`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="videos__placeholder">Здесь появятся результаты</div>
            )}
            {error && <div className="chat__error">{error}</div>}
          </section>

          <form className="chat__composer videos__composer" onSubmit={handleSubmit}>
            <textarea
              className="chat__input videos__input"
              rows={3}
              placeholder="Опиши видео..."
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

      {activeVideo && (
        <div className="videos__overlay" onClick={() => setActiveVideo(null)}>
          <div className="videos__overlay-body" onClick={(event) => event.stopPropagation()}>
            <button
              className="videos__overlay-close"
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Закрыть"
            >
              <svg
                className="videos__overlay-close-icon"
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
            {activeVideo.src ? (
              <video className="videos__overlay-video" src={activeVideo.src} controls />
            ) : (
              <div className="videos__overlay-placeholder">
                Видео сохранено в хранилище: {activeVideo.gcsUri}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Videos
