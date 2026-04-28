import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Clock, Users, ChefHat,
  Share2, Printer, Globe, Lock, UtensilsCrossed, Home,
} from 'lucide-react'
import { useRecipe, useDeleteRecipe, useTogglePublic, formatMinutes } from '../hooks/useRecipes'
import IngredientChecklist from '../components/recipe/IngredientChecklist'
import PhotoGallery from '../components/recipe/PhotoGallery'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DifficultyStars from '../components/ui/DifficultyStars'
import CategoryBadge from '../components/ui/CategoryBadge'
import { CATEGORIES } from '../types'
import toast from 'react-hot-toast'

type Tab = 'ingredientes' | 'pasos' | 'notas'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: recipe, isLoading } = useRecipe(id)
  const deleteRecipe = useDeleteRecipe()
  const togglePublic = useTogglePublic()
  const [tab, setTab] = useState<Tab>('ingredientes')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Receta no encontrada</p>
      </div>
    )
  }

  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']

  const handleDelete = async () => {
    await deleteRecipe.mutateAsync(recipe.id)
    navigate('/')
  }

  const handleShare = async () => {
    if (!recipe.is_public) {
      await togglePublic.mutateAsync({ id: recipe.id, isPublic: true })
    }
    const url = `${window.location.origin}/r/${recipe.id}`
    try {
      await navigator.share({ title: recipe.title, url })
    } catch {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado al portapapeles')
    }
  }

  const handlePrint = () => window.print()

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ingredientes', label: 'Ingredientes' },
    { key: 'pasos', label: 'Pasos' },
    { key: 'notas', label: 'Notas' },
  ]

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        {recipe.cover_url ? (
          <img src={recipe.cover_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl opacity-30">{cat.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Nav bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <Link
              to="/"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
            >
              <Home size={18} className="text-white" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
            >
              <Printer size={18} className="text-white" />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
            >
              <Share2 size={18} className="text-white" />
            </button>
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
            >
              <Edit2 size={18} className="text-white" />
            </Link>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <CategoryBadge category={recipe.category} size="sm" />
          <h1 className="text-2xl font-bold text-white mt-2 leading-tight">{recipe.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div id="recipe-content" className="pb-nav space-y-5">

        {/* Meta row */}
        <div className="px-4 pt-4 flex flex-wrap gap-x-5 gap-y-3">
          <DifficultyStars value={recipe.difficulty ?? 1} />
          <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Users size={14} />
            {recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}
          </span>
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

        {/* Description */}
        {recipe.description && (
          <p className="px-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {recipe.description}
          </p>
        )}

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

        {/* Photos gallery */}
        {recipe.photos && recipe.photos.length > 0 && (
          <PhotoGallery photos={recipe.photos} />
        )}

        {/* Cook mode button */}
        <div className="px-4">
          <Link
            to={`/recipes/${recipe.id}/cook`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-white text-sm"
            style={{ background: '#e8572a' }}
          >
            <UtensilsCrossed size={18} />
            Modo Cocinar
          </Link>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? '#e8572a' : 'transparent',
                  color: tab === t.key ? 'white' : 'var(--text-muted)',
                  borderRadius: '0.75rem',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          {tab === 'ingredientes' && (
            <div className="card p-2">
              <IngredientChecklist
                ingredients={recipe.ingredients ?? []}
                interactive={false}
              />
            </div>
          )}

          {tab === 'pasos' && (
            <div className="space-y-3">
              {(recipe.steps ?? []).length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  Sin pasos registrados
                </p>
              ) : (
                recipe.steps!.map((step, idx) => (
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
                      {step.timer_minutes && (
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
                ))
              )}
            </div>
          )}

          {tab === 'notas' && (
            <div className="card p-4">
              {recipe.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                  {recipe.notes}
                </p>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Sin notas
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {recipe.is_public
              ? <Globe size={14} style={{ color: '#22c55e' }} />
              : <Lock size={14} style={{ color: 'var(--text-muted)' }} />
            }
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {recipe.is_public ? 'Pública' : 'Privada'}
            </span>
            <button
              onClick={() => togglePublic.mutate({ id: recipe.id, isPublic: !recipe.is_public })}
              className="text-xs font-medium underline"
              style={{ color: '#e8572a' }}
            >
              {recipe.is_public ? 'Hacer privada' : 'Hacer pública'}
            </button>
          </div>

          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-sm text-red-500"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar receta"
        message={`¿Eliminar "${recipe.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
