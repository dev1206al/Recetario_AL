import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Timer as TimerIcon, Plus, Home, Sun, Moon, Minus, Users } from 'lucide-react'
import { useRecipe, formatMinutes } from '../hooks/useRecipes'
import { useTimers } from '../hooks/useTimer'
import { useTheme } from '../context/ThemeContext'
import IngredientChecklist from '../components/recipe/IngredientChecklist'
import TimerPanel from '../components/recipe/TimerPanel'
import { CATEGORIES } from '../types'
import SlidingTabs from '../components/ui/SlidingTabs'
import { haptics } from '../lib/haptics'

type View = 'ingredients' | 'steps'

export default function CookMode() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { data: recipe, isLoading } = useRecipe(id)
  const { timers, addTimer, toggleTimer, resetTimer, removeTimer } = useTimers()
  const [view, setView] = useState<View>('ingredients')
  const [currentStep, setCurrentStep] = useState(0)
  const [localServings, setLocalServings] = useState<number | null>(null)
  const wakeLock = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    navigator.wakeLock.request('screen').then(lock => { wakeLock.current = lock })
    return () => { wakeLock.current?.release() }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!recipe) return null

  const steps = recipe.steps ?? []
  const ingredients = recipe.ingredients ?? []
  const cat = CATEGORIES[recipe.category] ?? CATEGORIES['otros']
  const step = steps[currentStep]
  const baseServings = recipe.servings ?? 4
  const servings = localServings ?? baseServings
  const scaleFactor = servings / baseServings

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div aria-hidden style={{ height: 'env(safe-area-inset-top)' }} />
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={20} style={{ color: 'var(--text)' }} />
          </button>
          <Link
            to="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Home size={18} style={{ color: 'var(--text-muted)' }} />
          </Link>
          </div>

          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {cat.emoji} Modo Cocinar
            </p>
            <p className="text-sm font-semibold leading-tight max-w-[160px] truncate" style={{ color: 'var(--text)' }}>
              {recipe.title}
            </p>
          </div>

          <button
            onClick={toggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--text-muted)' }} />
              : <Moon size={16} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>
      </div>

      {/* Tab switch */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-4 flex-shrink-0">
        <SlidingTabs
          tabs={[
            { key: 'ingredients', label: 'Ingredientes' },
            { key: 'steps', label: 'Pasos' },
          ]}
          active={view}
          onChange={setView}
        />
      </div>

      {/* Servings stepper */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-3 flex-shrink-0 flex items-center gap-2">
        <Users size={14} style={{ color: 'var(--text-muted)' }} />
        <button
          onClick={() => setLocalServings(s => Math.max(1, (s ?? baseServings) - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <Minus size={13} style={{ color: 'var(--text)' }} />
        </button>
        <span className="text-sm font-semibold min-w-[1.5rem] text-center" style={{ color: 'var(--text)' }}>
          {servings}
        </span>
        <button
          onClick={() => setLocalServings(s => (s ?? baseServings) + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <Plus size={13} style={{ color: 'var(--text)' }} />
        </button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {servings === 1 ? 'porción' : 'porciones'}
        </span>
      </div>

      {/* Timers (always visible) */}
      {timers.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4 flex-shrink-0">
          <TimerPanel
            timers={timers}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onRemove={removeTimer}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-8">
        {view === 'ingredients' && (
          <div className="card p-2">
            <IngredientChecklist ingredients={ingredients} interactive scaleFactor={scaleFactor} />
          </div>
        )}

        {view === 'steps' && (
          <div className="space-y-4">
            {steps.length === 0 ? (
              <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                Sin pasos registrados
              </p>
            ) : (
              <>
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Paso {currentStep + 1} de {steps.length}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                        background: '#e8572a',
                      }}
                    />
                  </div>
                </div>

                {/* Current step card */}
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{
                    background: 'rgba(232,87,42,0.07)',
                    border: '1.5px solid rgba(232,87,42,0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                      style={{ background: '#e8572a', boxShadow: '0 4px 12px rgba(232,87,42,0.4)' }}
                    >
                      {currentStep + 1}
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#e8572a' }}>
                        Paso actual
                      </span>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {currentStep + 1} de {steps.length}
                      </p>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed" style={{ color: 'var(--text)' }}>
                    {step.content}
                  </p>

                  {step.timer_minutes && step.timer_minutes > 0 && (
                    <button
                      onClick={() => addTimer(`Paso ${currentStep + 1}`, step.timer_minutes!)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: 'rgba(232,87,42,0.12)',
                        color: '#e8572a',
                        border: '1px solid rgba(232,87,42,0.3)',
                      }}
                    >
                      <Plus size={14} />
                      <TimerIcon size={14} />
                      Iniciar timer · {formatMinutes(step.timer_minutes)}
                    </button>
                  )}
                </div>

                {/* Next step preview */}
                {currentStep < steps.length - 1 && (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                      SIGUIENTE
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {steps[currentStep + 1].content}
                    </p>
                  </div>
                )}

                {/* Completed */}
                {currentStep === steps.length - 1 && (
                  <div
                    className="rounded-2xl p-5 text-center space-y-2"
                    style={{
                      background: 'rgba(34,197,94,0.07)',
                      border: '1px solid rgba(34,197,94,0.25)',
                    }}
                  >
                    <span className="text-3xl">🎉</span>
                    <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                      ¡Receta completada!
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Buen provecho
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { haptics.light(); setCurrentStep(s => Math.max(0, s - 1)) }}
                    disabled={currentStep === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-30"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  <button
                    onClick={() => { haptics.medium(); setCurrentStep(s => Math.min(steps.length - 1, s + 1)) }}
                    disabled={currentStep === steps.length - 1}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-30"
                    style={{ background: '#e8572a', color: 'white' }}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
