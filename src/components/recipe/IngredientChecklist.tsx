import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Ingredient } from '../../types'
import { scaleAmount } from '../../lib/scaleAmount'

interface IngredientChecklistProps {
  ingredients: Ingredient[]
  interactive?: boolean
  scaleFactor?: number
}

export default function IngredientChecklist({ ingredients, interactive = true, scaleFactor = 1 }: IngredientChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    if (!interactive) return
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
        Sin ingredientes registrados
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {ingredients.map(ing => {
        const isChecked = checked.has(ing.id)
        return (
          <button
            key={ing.id}
            onClick={() => toggle(ing.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={{
              background: isChecked ? 'rgba(232,87,42,0.06)' : 'transparent',
              cursor: interactive ? 'pointer' : 'default',
            }}
          >
            <div
              className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                background: isChecked ? '#e8572a' : 'transparent',
                border: `2px solid ${isChecked ? '#e8572a' : 'var(--border)'}`,
              }}
            >
              {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <span
              className="flex-1 text-sm leading-snug"
              style={{
                color: isChecked ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: isChecked ? 'line-through' : 'none',
              }}
            >
              {ing.amount && <span className="font-semibold">{scaleAmount(ing.amount, scaleFactor)} {ing.unit} </span>}
              {ing.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
