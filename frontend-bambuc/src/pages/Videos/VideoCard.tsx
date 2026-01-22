import './VideoCard.css'

type VideoCardProps = {
  src?: string
  prompt: string
  gcsUri?: string
  onOpen: () => void
  onDownload: () => void
}

function VideoCard({ src, prompt, gcsUri, onOpen, onDownload }: VideoCardProps) {
  return (
    <div className="video-card">
      {src ? (
        <video className="video-card__preview" src={src} muted playsInline />
      ) : (
        <div className="video-card__preview video-card__preview--placeholder">
          Видео в GCS
        </div>
      )}
      <div className="video-card__meta">
        <div className="video-card__prompt">{prompt || 'Без описания'}</div>
        <div className="video-card__actions">
          <button className="video-card__icon-btn" type="button" onClick={onOpen} aria-label="Открыть">
            <svg
              className="video-card__icon"
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
          <button
            className="video-card__icon-btn"
            type="button"
            onClick={onDownload}
            aria-label="Скачать"
            disabled={!src}
          >
            <svg
              className="video-card__icon"
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
      {gcsUri && !src && <div className="video-card__hint">{gcsUri}</div>}
    </div>
  )
}

export default VideoCard
