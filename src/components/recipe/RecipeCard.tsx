import { useState, useRef } from 'react'
import { Clock, Users, UtensilsCrossed, Edit2, Share2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import { CATEGORIES } from '../../types'
import { formatMinutes, totalMinutes, useTogglePublic } from '../../hooks/useRecipes'
import DifficultyStars from '../ui/DifficultyStars'
import { useLongPress } from '../../hooks/useLongPress'
import { toastCopied, toastShared } from '../../lib/toasts'
import { useAuth } from '../../context/AuthContext'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']
  const minutes = totalMinutes(recipe)
  const navigate = useNavigate()
  const togglePublic = useTogglePublic()
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const isOwn = recipe.user_id === user?.id
  const authorLabel = !isOwn && recipe.author ? `@${recipe.author.username}` : null

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
            className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1 px-1.5 py-0.5 rounded-md backdrop-blur-sm max-w-[90%]"
            style={{ background: cat.color + 'cc' }}
          >
            <span className="text-xs leading-none shrink-0">{cat.emoji}</span>
            <span className="text-xs font-semibold leading-none text-white truncate">{cat.label}</span>
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
          <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
            <h2 className="recipe-title text-sm leading-snug line-clamp-1" style={{ color: 'var(--text)' }}>
              {recipe.title}
            </h2>
            <DifficultyStars value={recipe.difficulty ?? 1} size={11} />
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {minutes > 0 && (
                <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={10} />
                  {formatMinutes(minutes)}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                <Users size={10} />
                {recipe.servings ?? 4}
              </span>
              {authorLabel && (
                <span className="text-xs font-medium truncate min-w-0" style={{ color: '#e8572a' }}>
                  {authorLabel}
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>

      {/* ── Quick actions (long press) ───────────────────────── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          />
          <div
            className="relative w-full max-w-sm mx-4 mb-6 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              animation: 'slideUp 260ms cubic-bezier(0.32,0.72,0,1)',
              willChange: 'transform',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2.5 pb-2">
              <div className="w-9 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            <div className="pb-2">
              {[
                { icon: <UtensilsCrossed size={16} style={{ color: '#e8572a' }} />, label: 'Modo Cocinar', action: () => { setShowMenu(false); navigate(`/recipes/${recipe.id}/cook`) } },
                { icon: <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />, label: 'Editar', action: () => { setShowMenu(false); navigate(`/recipes/${recipe.id}/edit`) } },
                { icon: <Share2 size={16} style={{ color: 'var(--text-muted)' }} />, label: 'Compartir', action: handleShare },
              ].map(({ icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-sm"
                  style={{ color: 'var(--text)' }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            <div style={{ height: 'env(safe-area-inset-bottom)' }} />
          </div>
        </div>
      )}
    </>
  )
}
