import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatSidebar from '../Chat/ChatSidebar'
import ImageCard from './ImageCard'
import PromptChat from './PromptChat'
import UploadedImagesCard from './UploadedImagesCard'
import '../Chat/Chat.css'
import './Images.css'

type GeneratedImage = {
  id: string
  src: string
  prompt: string
  mimeType: string
}

type HistoryItem =
  | { id: string; type: 'input'; images: string[] }
  | { id: string; type: 'prompt'; text: string }
  | { id: string; type: 'output'; image: GeneratedImage }

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function Images() {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [inputImages, setInputImages] = useState<string[]>([])
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [activeMobilePanel, setActiveMobilePanel] = useState<'sidebar' | 'prompt' | 'generation'>('generation')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragCounterRef = useRef(0)

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

  const addFiles = async (files: File[]) => {
    if (files.length === 0) {
      return
    }
    try {
      const uploaded = await Promise.all(files.map(readFileAsDataUrl))
      setInputImages((prev) => [...prev, ...uploaded].slice(0, 3))
    } catch (readError) {
      console.error('[images.upload] failed', readError)
      setError('Не удалось загрузить изображение')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setActiveImage(null)

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Введите текст запроса')
      return
    }

    const historyEntries: HistoryItem[] = []
    if (inputImages.length > 0) {
      historyEntries.push({ id: createId(), type: 'input', images: [...inputImages] })
    }
    historyEntries.push({ id: createId(), type: 'prompt', text: trimmedPrompt })
    setHistory((prev) => [...prev, ...historyEntries])
    setInputImages([])
    setIsGenerating(true)

    try {
      const response = await fetch('/v1/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt, images: inputImages })
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
      setHistory((prev) => [...prev, { id: createId(), type: 'output', image: nextImage }])
    } catch (err) {
      console.error('[images.generate] failed', err)
      setError('Ошибка соединения с сервером')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const media = window.matchMedia('(max-width: 960px)')
    const update = () => setIsMobileLayout(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const isPromptCollapsedEffective = isMobileLayout ? activeMobilePanel !== 'prompt' : isPromptCollapsed
  const isSidebarCollapsedMobile = isMobileLayout ? activeMobilePanel !== 'sidebar' : undefined
  const isGenerationCollapsed = isMobileLayout && activeMobilePanel !== 'generation'

  const handlePromptToggle = () => {
    if (isMobileLayout) {
      setActiveMobilePanel('prompt')
      return
    }
    setIsPromptCollapsed((prev) => !prev)
  }

  const handleSidebarToggle = () => {
    if (isMobileLayout) {
      setActiveMobilePanel('sidebar')
    }
  }

  const handleGenerationHeaderClick = () => {
    if (isMobileLayout) {
      setActiveMobilePanel('generation')
    }
  }

  const handleGenerationHeaderKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isMobileLayout) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveMobilePanel('generation')
    }
  }

  return (
    <main
      className="chat bg-dark images"
      onDragEnter={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dragCounterRef.current += 1
        if (!isDragActive) {
          setIsDragActive(true)
        }
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
        if (dragCounterRef.current === 0) {
          setIsDragActive(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dragCounterRef.current = 0
        setIsDragActive(false)
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith('image/'),
        )
        void addFiles(files.slice(0, 3))
      }}
    >
      <header className="images__page-header">
        <div className="images__page-header-inner">
          <Link className="chat__back-icon" to="/" aria-label="На главную">
            <svg
              className="chat__back-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="chat__brand">
            <span className="chat__brand-mark">BAMBUC</span>
          </div>
        </div>
      </header>

      <div
        className={`chat__layout images__layout${!isMobileLayout && isPromptCollapsed ? ' images__layout--prompt-collapsed' : ''}${
          isMobileLayout ? ` images__layout--active-${activeMobilePanel}` : ''
        }`}
      >
        <ChatSidebar
          showNewChat
          showHeader={false}
          isMobile={isMobileLayout}
          isCollapsed={isSidebarCollapsedMobile}
          onToggleCollapse={handleSidebarToggle}
        />
        <PromptChat
          isCollapsed={isPromptCollapsedEffective}
          onToggleCollapse={handlePromptToggle}
          isMobile={isMobileLayout}
        />

        <section
          className={`chat__main images__generation${isGenerationCollapsed ? ' images__generation--collapsed' : ''}`}
        >
          <header
            className="chat__header"
            onClick={handleGenerationHeaderClick}
            onKeyDown={handleGenerationHeaderKeyDown}
            role={isMobileLayout ? 'button' : undefined}
            tabIndex={isMobileLayout ? 0 : undefined}
          >
            <div className="chat__title">Генерация изображений</div>
          </header>

          <section className="chat__window images__window">
            {history.length === 0 ? (
              <div className="images__placeholder">Здесь появятся результаты</div>
            ) : (
              <div className="images__history">
                {history.map((item) => {
                  if (item.type === 'input') {
                    return (
                      <div className="images__history-item" key={item.id}>
                        <UploadedImagesCard images={item.images} title="Загруженные изображения" />
                      </div>
                    )
                  }
                  if (item.type === 'prompt') {
                    return (
                      <div className="images__history-item images__history-item--prompt" key={item.id}>
                        <div className="images__prompt-bubble">{item.text}</div>
                      </div>
                    )
                  }
                  return (
                    <div className="images__history-item" key={item.id}>
                      <ImageCard
                        src={item.image.src}
                        prompt={item.image.prompt}
                        onOpen={() => setActiveImage(item.image)}
                        onDownload={() => {
                          const link = document.createElement('a')
                          link.href = item.image.src
                          link.download = `bambuc-image-${item.image.id}.${item.image.mimeType.includes('png') ? 'png' : 'jpg'}`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
            {error && <div className="chat__error">{error}</div>}
          </section>

          {inputImages.length > 0 && (
            <div className="images__pending">
              <UploadedImagesCard
                images={inputImages}
                title="К отправке"
                onRemove={(index) =>
                  setInputImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </div>
          )}

          <form className="chat__composer images__composer" onSubmit={handleSubmit}>
            <textarea
              className="chat__input images__input"
              rows={3}
              placeholder="Опиши изображение..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={isGenerating}
            />
            <div className="images__actions">
              <input
                ref={fileInputRef}
                className="images__upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? [])
                  await addFiles(files.slice(0, 3))
                }}
                disabled={isGenerating}
              />
              <button className="images__icon-btn images__icon-btn--primary" type="submit" disabled={isGenerating} aria-label="Создать">
                <svg className="images__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
              <button
                className="images__icon-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                aria-label="Загрузить изображение"
              >
                <svg className="images__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 1 1 4.95 4.95l-8.49 8.49a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                </svg>
              </button>
            </div>
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

      {isDragActive && (
        <div className="images__dropzone">
          <div className="images__dropzone-card">
            Перетащите изображения сюда
          </div>
        </div>
      )}
    </main>
  )
}

export default Images
