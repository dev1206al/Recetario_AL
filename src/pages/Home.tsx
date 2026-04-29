import { useState, useEffect, useRef } from 'react'
import { ChefHat, ArrowDownAZ, Clock, Star } from 'lucide-react'
import Layout from '../components/layout/Layout'
import RecipeCard from '../components/recipe/RecipeCard'
import SkeletonCard from '../components/recipe/SkeletonCard'
import { useRecipes, type SortBy } from '../hooks/useRecipes'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { CATEGORIES } from '../types'

const ALL_CATEGORIES = [
  { key: 'all', label: 'Todas', emoji: '✨' },
  ...Object.entries(CATEGORIES).map(([key, val]) => ({ key, label: val.label, emoji: val.emoji })),
]

const SORT_OPTIONS: { key: SortBy; label: string; Icon: typeof Clock }[] = [
  { key: 'recent', label: 'Recientes', Icon: Clock },
  { key: 'az', label: 'A–Z', Icon: ArrowDownAZ },
  { key: 'difficulty', label: 'Dificultad', Icon: Star },
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useRecipes(undefined, activeCategory === 'all' ? undefined : activeCategory, sortBy)

  const recipes = data?.pages.flat() ?? []

  const { pullY, refreshing, threshold } = usePullToRefresh(async () => {
    await refetch()
  })

  // Infinite scroll — load next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Layout>
      {/* Pull to refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullY > 0 ? pullY : 0 }}
      >
        <div
          className={`w-7 h-7 rounded-full border-2 border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
          style={{
            borderColor: '#e8572a',
            borderTopColor: 'transparent',
            transform: refreshing ? undefined : `rotate(${(pullY / threshold) * 360}deg)`,
          }}
        />
      </div>

      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{
                background: activeCategory === cat.key ? '#e8572a' : 'var(--surface-2)',
                color: activeCategory === cat.key ? 'white' : 'var(--text-muted)',
                border: activeCategory === cat.key ? 'none' : '1px solid var(--border)',
              }}
            >
              <span>{cat.emoji}</span>
              {cat.key === 'all'
                ? cat.label
                : cat.label.split('&')[0].trim().split(' ')[0]
              }
            </button>
          ))}
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: sortBy === key ? 'rgba(232,87,42,0.12)' : 'var(--surface-2)',
                color: sortBy === key ? '#e8572a' : 'var(--text-muted)',
                border: sortBy === key ? '1px solid rgba(232,87,42,0.3)' : '1px solid var(--border)',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 pt-2">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : recipes.length === 0 ? (
        activeCategory !== 'all' ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <ChefHat size={48} style={{ color: 'var(--border)' }} />
            <p className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>Sin resultados</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Intenta con otra categoría</p>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 pt-10 pb-8 text-center gap-6">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(232,87,42,0.10)', border: '2px dashed rgba(232,87,42,0.3)' }}
            >
              <span className="text-5xl">🍳</span>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold recipe-title" style={{ color: 'var(--text)' }}>Tu recetario está vacío</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Guarda tus recetas favoritas para tenerlas siempre a mano.
              </p>
            </div>
            <div className="w-full rounded-2xl p-4 space-y-3 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {[
                { emoji: '📝', text: 'Toca + para añadir tu primera receta' },
                { emoji: '📸', text: 'Agrega fotos a tus platos' },
                { emoji: '🔗', text: 'Comparte recetas con un enlace' },
                { emoji: '👨‍🍳', text: 'Usa el modo cocinar paso a paso' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-lg">{emoji}</span>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="px-4 pt-1">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
            {hasNextPage && ' · desliza para más'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recipes.map((recipe, i) => (
              <div
                key={recipe.id}
                style={{
                  animation: 'cardEnter 0.3s ease both',
                  animationDelay: `${Math.min(i * 40, 300)}ms`,
                }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>

          {/* Sentinel + spinner */}
          <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-2">
            {isFetchingNextPage && (
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#e8572a', borderTopColor: 'transparent' }} />
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
