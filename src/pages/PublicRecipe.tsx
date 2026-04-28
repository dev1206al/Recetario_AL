import { useParams } from 'react-router-dom'
import { Clock, Users, ChefHat, Printer } from 'lucide-react'
import { usePublicRecipe, formatMinutes } from '../hooks/useRecipes'
import PhotoGallery from '../components/recipe/PhotoGallery'
import DifficultyStars from '../components/ui/DifficultyStars'
import CategoryBadge from '../components/ui/CategoryBadge'
import IngredientChecklist from '../components/recipe/IngredientChecklist'
import { CATEGORIES } from '../types'

export default function PublicRecipe() {
  const { id } = useParams<{ id: string }>()
  const { data: recipe, isLoading, isError } = usePublicRecipe(id)

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !recipe) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg)' }}>
        <ChefHat size={48} style={{ color: 'var(--border)' }} />
        <p className="font-semibold" style={{ color: 'var(--text)' }}>Receta no disponible</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Esta receta es privada o no existe.
        </p>
      </div>
    )
  }

  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={() => window.print()}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
        >
          <Printer size={18} className="text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <CategoryBadge category={recipe.category} size="sm" />
          <h1 className="text-2xl font-bold text-white mt-2 leading-tight">{recipe.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12 space-y-6">
        {/* Branding */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <DifficultyStars value={recipe.difficulty ?? 1} />
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Users size={14} />
              {recipe.servings} porciones
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

          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: '#e8572a' }}>Recetario AL</p>
          </div>
        </div>

        {recipe.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {recipe.description}
          </p>
        )}

        {recipe.photos && recipe.photos.length > 0 && (
          <PhotoGallery photos={recipe.photos} />
        )}

        {/* Ingredients */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Ingredientes</h2>
          <div className="card p-2">
            <IngredientChecklist ingredients={recipe.ingredients ?? []} interactive />
          </div>
        </div>

        {/* Steps */}
        {(recipe.steps ?? []).length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Preparación</h2>
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

        {/* Notes */}
        {recipe.notes && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Notas del chef</h2>
            <div className="card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                {recipe.notes}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Compartido con ❤️ desde Recetario AL
        </p>
      </div>
    </div>
  )
}
