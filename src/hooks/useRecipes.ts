import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Recipe, RecipeFormData } from '../types'
import toast from 'react-hot-toast'

// ── Fetch all recipes for the logged-in user ─────────────────
export function useRecipes(search?: string, category?: string) {
  return useQuery({
    queryKey: ['recipes', search, category],
    queryFn: async (): Promise<Recipe[]> => {
      let query = supabase
        .from('recipes')
        .select('*, photos:recipe_photos(id, url, is_cover, order_index)')
        .order('created_at', { ascending: false })

      if (search) query = query.ilike('title', `%${search}%`)
      if (category && category !== 'all') query = query.eq('category', category)

      const { data, error } = await query
      if (error) throw error
      return data as Recipe[]
    },
  })
}

// ── Fetch a single recipe with all related data ───────────────
export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['recipe', id],
    enabled: !!id,
    queryFn: async (): Promise<Recipe> => {
      const [recipeRes, ingredientsRes, stepsRes, photosRes] = await Promise.all([
        supabase.from('recipes').select('*').eq('id', id!).single(),
        supabase.from('ingredients').select('*').eq('recipe_id', id!).order('order_index'),
        supabase.from('steps').select('*').eq('recipe_id', id!).order('order_index'),
        supabase.from('recipe_photos').select('*').eq('recipe_id', id!).order('order_index'),
      ])
      if (recipeRes.error) throw recipeRes.error
      return {
        ...recipeRes.data,
        ingredients: ingredientsRes.data ?? [],
        steps: stepsRes.data ?? [],
        photos: photosRes.data ?? [],
      } as Recipe
    },
  })
}

// ── Fetch a public recipe (no auth required) ──────────────────
export function usePublicRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['public-recipe', id],
    enabled: !!id,
    queryFn: async (): Promise<Recipe> => {
      const [recipeRes, ingredientsRes, stepsRes, photosRes] = await Promise.all([
        supabase.from('recipes').select('*').eq('id', id!).eq('is_public', true).single(),
        supabase.from('ingredients').select('*').eq('recipe_id', id!).order('order_index'),
        supabase.from('steps').select('*').eq('recipe_id', id!).order('order_index'),
        supabase.from('recipe_photos').select('*').eq('recipe_id', id!).order('order_index'),
      ])
      if (recipeRes.error) throw recipeRes.error
      return {
        ...recipeRes.data,
        ingredients: ingredientsRes.data ?? [],
        steps: stepsRes.data ?? [],
        photos: photosRes.data ?? [],
      } as Recipe
    },
  })
}

// ── Save (create or update) a recipe ─────────────────────────
export function useSaveRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      userId,
      recipeId,
      coverUrl,
    }: {
      data: RecipeFormData
      userId: string
      recipeId?: string
      coverUrl?: string | null
    }) => {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        difficulty: data.difficulty,
        servings: data.servings,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        rest_time: data.rest_time,
        notes: data.notes,
        is_public: data.is_public,
        ...(coverUrl !== undefined ? { cover_url: coverUrl } : {}),
      }

      let id: string

      if (recipeId) {
        const { error } = await supabase.from('recipes').update(payload).eq('id', recipeId)
        if (error) throw error
        id = recipeId
      } else {
        const { data: created, error } = await supabase
          .from('recipes')
          .insert({ ...payload, user_id: userId })
          .select('id')
          .single()
        if (error) throw error
        id = created.id
      }

      // Replace ingredients
      await supabase.from('ingredients').delete().eq('recipe_id', id)
      if (data.ingredients.length > 0) {
        const { error } = await supabase.from('ingredients').insert(
          data.ingredients.map((ing, i) => ({ ...ing, recipe_id: id, order_index: i }))
        )
        if (error) throw error
      }

      // Replace steps
      await supabase.from('steps').delete().eq('recipe_id', id)
      if (data.steps.length > 0) {
        const { error } = await supabase.from('steps').insert(
          data.steps.map((step, i) => ({ ...step, recipe_id: id, order_index: i }))
        )
        if (error) throw error
      }

      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe', id] })
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`)
    },
  })
}

// ── Delete a recipe ───────────────────────────────────────────
export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Receta eliminada')
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    },
  })
}

// ── Upload photos ─────────────────────────────────────────────
export async function uploadPhoto(
  file: File,
  userId: string,
  recipeId: string
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${recipeId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('recipe-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('recipe-photos').getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from('recipe-photos').remove([path])
  if (error) throw error
}

export async function savePhotoRecord(
  recipeId: string,
  storagePath: string,
  url: string,
  isCover: boolean,
  orderIndex: number
): Promise<void> {
  const { error } = await supabase.from('recipe_photos').insert({
    recipe_id: recipeId,
    storage_path: storagePath,
    url,
    is_cover: isCover,
    order_index: orderIndex,
  })
  if (error) throw error
}

export async function deletePhotoRecord(id: string, storagePath: string): Promise<void> {
  await deletePhoto(storagePath)
  const { error } = await supabase.from('recipe_photos').delete().eq('id', id)
  if (error) throw error
}

export async function updateCoverUrl(recipeId: string, url: string | null): Promise<void> {
  const { error } = await supabase.from('recipes').update({ cover_url: url }).eq('id', recipeId)
  if (error) throw error
}

// ── Toggle public ─────────────────────────────────────────────
export function useTogglePublic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('recipes')
        .update({ is_public: isPublic })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe'] })
    },
  })
}

export function totalMinutes(recipe: Pick<Recipe, 'prep_time' | 'cook_time' | 'rest_time'>): number {
  return (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0) + (recipe.rest_time ?? 0)
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
