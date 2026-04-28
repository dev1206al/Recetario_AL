import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { RecipePhoto } from '../../types'

interface PhotoGalleryProps {
  photos: RecipePhoto[]
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  const sorted = [...photos].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1
    if (!a.is_cover && b.is_cover) return 1
    return a.order_index - b.order_index
  })

  const prev = () => setLightbox(i => (i === null ? null : i === 0 ? sorted.length - 1 : i - 1))
  const next = () => setLightbox(i => (i === null ? null : i === sorted.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2">
        {sorted.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(idx)}
            className="flex-shrink-0 rounded-xl overflow-hidden relative"
            style={{
              width: sorted.length === 1 ? '100%' : 120,
              height: sorted.length === 1 ? 220 : 100,
            }}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
            />
            {photo.is_cover && (
              <span className="absolute bottom-1.5 left-1.5 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-md font-medium">
                portada
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <X size={20} className="text-white" />
          </button>

          {sorted.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </>
          )}

          <img
            src={sorted[lightbox].url}
            alt=""
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: i === lightbox ? 'white' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
