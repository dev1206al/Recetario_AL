import { useState } from 'react'
import { Clock, Users, ChefHat, Printer, Share2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { usePublicRecipe, formatMinutes } from '../hooks/useRecipes'
import PhotoGallery from '../components/recipe/PhotoGallery'
import DifficultyStars from '../components/ui/DifficultyStars'
import IngredientChecklist from '../components/recipe/IngredientChecklist'
import { CATEGORIES } from '../types'
import toast from 'react-hot-toast'

export default function PublicRecipe() {
  const { id } = useParams<{ id: string }>()
  const { data: recipe, isLoading, isError } = usePublicRecipe(id)
  const [localServings, setLocalServings] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#e8572a', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (isError || !recipe) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <ChefHat size={52} style={{ color: 'var(--border)' }} />
        <p className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Receta no disponible</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Esta receta es privada o no existe.</p>
      </div>
    )
  }

  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']
  const coverUrl = recipe.cover_url
    ?? recipe.photos?.find(p => p.is_cover)?.url
    ?? recipe.photos?.[0]?.url
    ?? null
  const baseServings = recipe.servings ?? 4
  const servings = localServings ?? baseServings
  const scaleFactor = servings / baseServings

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.share({ title: recipe.title, url })
    } catch {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado al portapapeles')
    }
  }

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>

      {/* ── Header con branding ──────────────────────────────── */}
      <div
        className="sticky top-0 z-40"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div aria-hidden style={{ height: 'env(safe-area-inset-top)' }} />
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
          {/* Logo + nombre */}
          <div className="flex items-center gap-2">
            <img src="/logo-al.svg" alt="Recetario AL" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>
              Recetario <span style={{ color: '#e8572a' }}>AL</span>
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              aria-label="Compartir"
            >
              <Share2 size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={() => window.print()}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              aria-label="Imprimir"
            >
              <Printer size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Foto de portada (solo si existe) ────────────────── */}
      {coverUrl && (
        <div className="mx-auto max-w-5xl px-0 md:px-8 md:pt-5">
          <div className="relative h-52 md:h-80 overflow-hidden md:rounded-2xl">
            <img src={coverUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* ── Contenido ───────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl pb-16 space-y-6">

        {/* Título + categoría */}
        <div className="px-4 pt-5 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{cat.emoji}</span>
            <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
            {recipe.title}
          </h1>
        </div>

        {/* Meta */}
        <div className="px-4 flex flex-wrap gap-x-5 gap-y-2">
          <DifficultyStars value={recipe.difficulty ?? 1} />

          {/* Stepper de porciones */}
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <button
              onClick={() => setLocalServings(s => Math.max(1, (s ?? baseServings) - 1))}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >−</button>
            <span className="text-sm font-semibold min-w-[1.5rem] text-center" style={{ color: 'var(--text)' }}>
              {servings}
            </span>
            <button
              onClick={() => setLocalServings(s => (s ?? baseServings) + 1)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >+</button>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {servings === 1 ? 'porción' : 'porciones'}
            </span>
          </div>

          {recipe.prep_time > 0 && (
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Clock size={14} />
              Prep: {formatMinutes(recipe.prep_time)}
            </span>
          )}
          {recipe.cook_time > 0 && (
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <ChefHat size={14} />
              Cocción: {formatMinutes(recipe.cook_time)}
            </span>
          )}
          {recipe.rest_time > 0 && (
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Clock size={14} />
              Reposo: {formatMinutes(recipe.rest_time)}
            </span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4">
            {recipe.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Descripción */}
        {recipe.description && (
          <p className="px-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {recipe.description}
          </p>
        )}

        {/* Galería de fotos */}
        {recipe.photos && recipe.photos.length > 0 && (
          <PhotoGallery photos={recipe.photos} />
        )}

        {/* Ingredientes */}
        <div className="px-4 space-y-3">
          <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>Ingredientes</h2>
          <div className="card p-2">
            <IngredientChecklist
              ingredients={recipe.ingredients ?? []}
              interactive
              scaleFactor={scaleFactor}
            />
          </div>
        </div>

        {/* Pasos */}
        {(recipe.steps ?? []).length > 0 && (
          <div className="px-4 space-y-3">
            <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>Preparación</h2>
            <div className="space-y-3">
              {recipe.steps!.map((step, idx) => (
                <div key={step.id} className="card p-4 flex gap-4">
                  <div
                    className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: '#e8572a' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      {step.content}
                    </p>
                    {step.timer_minutes && step.timer_minutes > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(232,87,42,0.12)', color: '#e8572a' }}
                      >
                        <Clock size={11} />
                        {formatMinutes(step.timer_minutes)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {recipe.notes && (
          <div className="px-4 space-y-3">
            <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>Notas</h2>
            <div className="card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                {recipe.notes}
              </p>
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div
          className="mx-4 rounded-2xl p-5 flex items-center justify-between no-print"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recetario AL</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tu recetario personal digital</p>
          </div>
          <img src="/logo-al.svg" alt="Recetario AL" className="w-10 h-10 rounded-2xl" />
        </div>

      </div>
    </div>
  )
}
