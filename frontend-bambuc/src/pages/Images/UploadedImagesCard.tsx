import './UploadedImagesCard.css'

type UploadedImagesCardProps = {
  images: string[]
  title?: string
  onRemove?: (index: number) => void
}

function UploadedImagesCard({ images, title = 'Загруженные изображения', onRemove }: UploadedImagesCardProps) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className="uploaded-images">
      <div className="uploaded-images__title">{title}</div>
      <div className="uploaded-images__grid">
        {images.map((src, index) => (
          <div className="uploaded-images__item" key={`${src}-${index}`}>
            <img src={src} alt={`Upload ${index + 1}`} />
            {onRemove && (
              <button
                type="button"
                className="uploaded-images__remove"
                onClick={() => onRemove(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadedImagesCard
