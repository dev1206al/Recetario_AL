import { useState, useDeferredValue, useRef, useEffect } from 'react'
import { Search, X, ChefHat } from 'lucide-react'
import Layout from '../components/layout/Layout'
import RecipeCard from '../components/recipe/RecipeCard'
import SkeletonCard from '../components/recipe/SkeletonCard'
import { useRecipes } from '../hooks/useRecipes'
import { CATEGORIES } from '../types'

const ALL_CATEGORIES = [
  { key: 'all', label: 'Todas', emoji: '✨' },
  ...Object.entries(CATEGORIES).map(([key, val]) => ({ key, label: val.label, emoji: val.emoji })),
]

export default function SearchPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const deferredSearch = useDeferredValue(search)
  const inputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200)
    return () => clearTimeout(t)
  }, [])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useRecipes(
    deferredSearch || undefined,
    activeCategory === 'all' ? undefined : activeCategory,
  )

  const recipes = data?.pages.flat() ?? []
  const hasQuery = !!deferredSearch || activeCategory !== 'all'

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
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar recetas, ingredientes..."
            className="input-base pl-10 pr-10"
            inputMode="search"
            enterKeyHint="search"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

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
              {cat.key === 'all' ? cat.label : cat.label.split('&')[0].trim().split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <Search size={44} style={{ color: 'var(--border)' }} />
          <p className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>Busca tu receta</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Escribe un nombre o filtra por categoría</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 pt-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <ChefHat size={48} style={{ color: 'var(--border)' }} />
          <p className="mt-4 font-semibold" style={{ color: 'var(--text)' }}>Sin resultados</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Intenta con otros términos o filtros</p>
        </div>
      ) : (
        <div className="px-4 pt-1">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recipes.map((recipe, i) => (
              <div
                key={recipe.id}
                style={{ animation: 'cardEnter 0.3s ease both', animationDelay: `${Math.min(i * 40, 240)}ms` }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
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
