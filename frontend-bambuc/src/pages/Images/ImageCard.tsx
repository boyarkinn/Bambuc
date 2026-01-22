import './ImageCard.css'

type ImageCardProps = {
  src: string
  prompt: string
  onOpen: () => void
  onDownload: () => void
}

function ImageCard({ src, prompt, onOpen, onDownload }: ImageCardProps) {
  return (
    <div className="image-card">
      <img className="image-card__preview" src={src} alt={prompt || 'Generated image'} />
      <div className="image-card__meta">
        <div className="image-card__prompt">{prompt || 'Без описания'}</div>
        <div className="image-card__actions">
          <button className="image-card__icon-btn" type="button" onClick={onOpen} aria-label="Увеличить">
            <svg
              className="image-card__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
          </button>
          <button className="image-card__icon-btn" type="button" onClick={onDownload} aria-label="Скачать">
            <svg
              className="image-card__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCard
