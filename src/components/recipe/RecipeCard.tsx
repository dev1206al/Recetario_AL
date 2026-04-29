import { useState, useRef } from 'react'
import { Clock, Users, UtensilsCrossed, Edit2, Share2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import { CATEGORIES } from '../../types'
import { formatMinutes, totalMinutes, useTogglePublic } from '../../hooks/useRecipes'
import DifficultyStars from '../ui/DifficultyStars'
import { useLongPress } from '../../hooks/useLongPress'
import { toastCopied, toastShared } from '../../lib/toasts'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']
  const minutes = totalMinutes(recipe)
  const navigate = useNavigate()
  const togglePublic = useTogglePublic()
  const [showMenu, setShowMenu] = useState(false)

  const photos = [...(recipe.photos ?? [])].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1
    if (!a.is_cover && b.is_cover) return 1
    return a.order_index - b.order_index
  })
  const hasPhotos = photos.length > 0
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const longPress = useLongPress(() => setShowMenu(true))

  const prev = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrent(i => (i === 0 ? photos.length - 1 : i - 1))
  }
  const next = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrent(i => (i === photos.length - 1 ? 0 : i + 1))
  }

  const onSwipeTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    longPress.onTouchStart(e)
  }
  const onSwipeTouchMove = (e: React.TouchEvent) => { longPress.onTouchMove(e) }
  const onSwipeTouchEnd = (e: React.TouchEvent) => {
    longPress.onTouchEnd()
    if (touchStartX.current === null) return
    if (!longPress.didFire()) {
      const diff = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 40) diff > 0 ? next(e) : prev(e)
    }
    touchStartX.current = null
  }

  const handleShare = async () => {
    setShowMenu(false)
    if (!recipe.is_public) await togglePublic.mutateAsync({ id: recipe.id, isPublic: true })
    const url = `${window.location.origin}/r/${recipe.id}`
    try { await navigator.share({ title: recipe.title, url }); toastShared() }
    catch { await navigator.clipboard.writeText(url); toastCopied() }
  }

  return (
    <>
      <article className="card overflow-hidden">
        {/* ── Foto / Carrusel ─────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}
          onTouchStart={hasPhotos && photos.length > 1 ? onSwipeTouchStart : longPress.onTouchStart}
          onTouchMove={hasPhotos && photos.length > 1 ? onSwipeTouchMove : longPress.onTouchMove}
          onTouchEnd={hasPhotos && photos.length > 1 ? onSwipeTouchEnd : longPress.onTouchEnd}
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
              onTouchStart={longPress.onTouchStart}
              onTouchMove={longPress.onTouchMove}
              onTouchEnd={longPress.onTouchEnd}
              style={{ background: `linear-gradient(135deg, ${cat.color}33 0%, ${cat.color}11 100%)` }}
            >
              <span className="text-5xl opacity-40">{cat.emoji}</span>
            </button>
          )}

          {/* Badge categoría */}
          <div
            className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm"
            style={{ background: cat.color + 'cc' }}
          >
            <span className="text-xs leading-none">{cat.emoji}</span>
            <span className="text-xs font-semibold leading-none text-white">{cat.label}</span>
          </div>

          {photos.length > 1 && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-full transition-all duration-200"
                    style={{ width: idx === current ? 16 : 5, height: 5, background: idx === current ? 'white' : 'rgba(255,255,255,0.5)' }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Info ────────────────────────────────────────────── */}
        <Link
          to={`/recipes/${recipe.id}`}
          className="block"
          onTouchStart={longPress.onTouchStart}
          onTouchMove={longPress.onTouchMove}
          onTouchEnd={longPress.onTouchEnd}
        >
          <div className="px-4 pt-3 pb-4 space-y-2">
            <h2 className="recipe-title text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
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
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </article>

      {/* ── Quick actions (long press) ───────────────────────── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowMenu(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-sm mx-4 mb-4 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              animation: 'slideUp 200ms ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            {/* Title */}
            <p className="recipe-title text-sm font-semibold px-5 pt-1 pb-4 line-clamp-1" style={{ color: 'var(--text)' }}>
              {recipe.title}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => { setShowMenu(false); navigate(`/recipes/${recipe.id}/cook`) }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                <UtensilsCrossed size={16} style={{ color: '#e8572a' }} />
                Modo Cocinar
              </button>
              <button
                onClick={() => { setShowMenu(false); navigate(`/recipes/${recipe.id}/edit`) }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                Editar
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text)' }}
              >
                <Share2 size={16} style={{ color: 'var(--text-muted)' }} />
                Compartir
              </button>
            </div>

            <div style={{ height: 'env(safe-area-inset-bottom)' }} />
          </div>
        </div>
      )}
    </>
  )
}
