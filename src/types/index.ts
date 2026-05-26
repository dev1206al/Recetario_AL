export type Category =
  | 'desayunos'
  | 'entradas'
  | 'platos-fuertes'
  | 'pastas'
  | 'sopas'
  | 'salsas'
  | 'postres'
  | 'reposteria'
  | 'bebidas'
  | 'jugos'
  | 'otros'

export const CATEGORIES: Record<Category, { label: string; color: string; emoji: string }> = {
  'desayunos':     { label: 'Desayunos & Brunch',      color: '#f59e0b', emoji: '🌅' },
  'entradas':      { label: 'Entradas & Ensaladas',     color: '#22c55e', emoji: '🥗' },
  'platos-fuertes':{ label: 'Platos Fuertes',           color: '#ef4444', emoji: '🍖' },
  'pastas':        { label: 'Pastas & Arroces',         color: '#f97316', emoji: '🍝' },
  'sopas':         { label: 'Sopas & Cremas',           color: '#fb923c', emoji: '🍲' },
  'salsas':        { label: 'Salsas & Aderezos',        color: '#dc2626', emoji: '🫙' },
  'postres':       { label: 'Postres',                  color: '#ec4899', emoji: '🍮' },
  'reposteria':    { label: 'Repostería & Panadería',   color: '#a855f7', emoji: '🎂' },
  'bebidas':       { label: 'Bebidas',                  color: '#06b6d4', emoji: '🥤' },
  'jugos':         { label: 'Jugos & Licuados',         color: '#84cc16', emoji: '🥝' },
  'otros':         { label: 'Otros',                    color: '#6b7280', emoji: '🍴' },
}

export interface Ingredient {
  id: string
  recipe_id: string
  name: string
  amount: string
  unit: string
  order_index: number
}

export interface Step {
  id: string
  recipe_id: string
  content: string
  timer_minutes: number | null
  order_index: number
}

export interface RecipePhoto {
  id: string
  recipe_id: string
  storage_path: string
  url: string
  is_cover: boolean
  order_index: number
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  created_at: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string
  category: Category
  tags: string[]
  difficulty: 1 | 2 | 3
  servings: number
  prep_time: number
  cook_time: number
  rest_time: number
  notes: string
  is_public: boolean
  cover_url: string | null
  created_at: string
  updated_at: string
  ingredients?: Ingredient[]
  steps?: Step[]
  photos?: RecipePhoto[]
  author?: { username: string; display_name: string | null }
}

export interface RecipeFormData {
  title: string
  description: string
  category: Category
  tags: string[]
  difficulty: 1 | 2 | 3
  servings: number
  prep_time: number
  cook_time: number
  rest_time: number
  notes: string
  is_public: boolean
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[]
  steps: Omit<Step, 'id' | 'recipe_id'>[]
}

// Timer state used in CookMode
export interface TimerState {
  id: string
  name: string
  totalSeconds: number
  remaining: number
  running: boolean
  done: boolean
}
