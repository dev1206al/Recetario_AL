import { useState, useRef } from 'react'
import { Clock, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import { CATEGORIES } from '../../types'
import { formatMinutes, totalMinutes } from '../../hooks/useRecipes'
import DifficultyStars from '../ui/DifficultyStars'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']
  const minutes = totalMinutes(recipe)
  const navigate = useNavigate()

  const photos = [...(recipe.photos ?? [])].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1
    if (!a.is_cover && b.is_cover) return 1
    return a.order_index - b.order_index
  })
  const hasPhotos = photos.length > 0

  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const prev = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent(i => (i === 0 ? photos.length - 1 : i - 1))
  }

  const next = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent(i => (i === photos.length - 1 ? 0 : i + 1))
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next(e) : prev(e)
    touchStartX.current = null
  }

  return (
    <article className="card overflow-hidden transition-transform duration-150 active:scale-[0.98]">
      {/* ── Foto / Carrusel ─────────────────────────────────── */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: 'var(--surface-2)' }}
        onTouchStart={hasPhotos && photos.length > 1 ? onTouchStart : undefined}
        onTouchEnd={hasPhotos && photos.length > 1 ? onTouchEnd : undefined}
      >
        {hasPhotos ? (
          <>
            {photos.map((photo, idx) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: idx === current ? 1 : 0 }}
              />
            ))}

            {photos.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-0 top-0 w-1/3 h-full z-10" aria-label="Foto anterior" />
                <button onClick={next} className="absolute right-0 top-0 w-1/3 h-full z-10" aria-label="Foto siguiente" />
              </>
            )}
            <button
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="absolute left-1/3 top-0 w-1/3 h-full z-10"
              aria-label="Ver receta"
            />
          </>
        ) : (
          <button
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            className="w-full h-full flex items-center justify-center"
          >
            <span className="text-5xl opacity-30">{cat.emoji}</span>
          </button>
        )}

        {/* Dots — solo cuando hay varias fotos */}
        {photos.length > 1 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: idx === current ? 16 : 5,
                    height: 5,
                    background: idx === current ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────── */}
      <Link to={`/recipes/${recipe.id}`} className="block">
        <div className="px-4 pt-3 pb-4 space-y-2">

          {/* Categoría — debajo de la foto, discreta */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{cat.emoji}</span>
            <span
              className="text-xs font-semibold"
              style={{ color: cat.color }}
            >
              {cat.label}
            </span>
          </div>

          <h2 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
            {recipe.title}
          </h2>

          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <DifficultyStars value={recipe.difficulty ?? 1} size={12} />
            <div className="flex items-center gap-3">
              {minutes > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={11} />
                  {formatMinutes(minutes)}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Users size={11} />
                {recipe.servings ?? 4}
              </span>
            </div>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
