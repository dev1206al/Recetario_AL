import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Timer, Home, Camera, X, Star,
} from 'lucide-react'
import UnitInput from '../components/ui/UnitInput'
import { Link } from 'react-router-dom'
import { useRecipe, useSaveRecipe, uploadPhoto, savePhotoRecord, deletePhotoRecord, updateCoverUrl } from '../hooks/useRecipes'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, type Category, type RecipePhoto } from '../types'
import TagInput from '../components/ui/TagInput'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'El título es requerido').max(120),
  description: z.string().max(500).optional().default(''),
  category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  servings: z.coerce.number().int().min(1).max(100),
  prep_time: z.coerce.number().int().min(0),
  cook_time: z.coerce.number().int().min(0),
  rest_time: z.coerce.number().int().min(0),
  notes: z.string().max(2000).optional().default(''),
  is_public: z.boolean(),
  tags: z.array(z.string()),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().optional().default(''),
    unit: z.string().optional().default(''),
    order_index: z.number().default(0),
  })),
  steps: z.array(z.object({
    content: z.string().min(1),
    timer_minutes: z.coerce.number().int().min(0).nullable().default(null),
    order_index: z.number().default(0),
  })),
})

type FormValues = z.infer<typeof schema>

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id
  const { data: existing } = useRecipe(isEdit ? id : undefined)
  const saveRecipe = useSaveRecipe()
  const [tags, setTags] = useState<string[]>([])
  const [currentSection, setCurrentSection] = useState<'info' | 'ingredients' | 'steps' | 'notes' | 'photos'>('info')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<RecipePhoto[]>([])
  const [coverIdx, setCoverIdx] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: '',
      description: '',
      category: 'otros',
      difficulty: 1,
      servings: 4,
      prep_time: 0,
      cook_time: 0,
      rest_time: 0,
      notes: '',
      is_public: false,
      tags: [],
      ingredients: [{ name: '', amount: '', unit: '', order_index: 0 }],
      steps: [{ content: '', timer_minutes: null, order_index: 0 }],
    },
  })

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
    move: moveIngredient,
  } = useFieldArray({ control, name: 'ingredients' })

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({ control, name: 'steps' })

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        title: existing.title,
        description: existing.description ?? '',
        category: existing.category,
        difficulty: existing.difficulty ?? 1,
        servings: existing.servings ?? 4,
        prep_time: existing.prep_time ?? 0,
        cook_time: existing.cook_time ?? 0,
        rest_time: existing.rest_time ?? 0,
        notes: existing.notes ?? '',
        is_public: existing.is_public ?? false,
        tags: existing.tags ?? [],
        ingredients: existing.ingredients && existing.ingredients.length > 0
          ? existing.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit, order_index: i.order_index }))
          : [{ name: '', amount: '', unit: '', order_index: 0 }],
        steps: existing.steps && existing.steps.length > 0
          ? existing.steps.map(s => ({ content: s.content, timer_minutes: s.timer_minutes, order_index: s.order_index }))
          : [{ content: '', timer_minutes: null, order_index: 0 }],
      })
      setTags(existing.tags ?? [])
      setExistingPhotos(existing.photos ?? [])
    }
  }, [existing, isEdit, reset])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) return
    try {
      const savedId = await saveRecipe.mutateAsync({
        data: { ...data, tags },
        userId: user.id,
        recipeId: isEdit ? id : undefined,
      })

      // Upload any pending photo files
      let newCoverUrl: string | null = null
      if (photoFiles.length > 0) {
        const baseIndex = existingPhotos.length
        for (let i = 0; i < photoFiles.length; i++) {
          const { path, url } = await uploadPhoto(photoFiles[i], user.id, savedId)
          const isCover = baseIndex === 0 && i === coverIdx
          await savePhotoRecord(savedId, path, url, isCover, baseIndex + i)
          if (isCover) newCoverUrl = url
        }
      }

      // Sync cover_url on the recipe row
      if (newCoverUrl) {
        await updateCoverUrl(savedId, newCoverUrl)
      } else if (!isEdit && existingPhotos.length === 0 && photoFiles.length === 0) {
        // no photos at all — clear cover_url
      } else if (existingPhotos.length > 0 && photoFiles.length === 0) {
        // existing photos unchanged — ensure cover_url matches the cover photo
        const cover = existingPhotos.find(p => p.is_cover) ?? existingPhotos[0]
        await updateCoverUrl(savedId, cover.url)
      }

      toast.success(isEdit ? 'Receta actualizada' : 'Receta creada')
      navigate(`/recipes/${savedId}`)
    } catch {
      // error handled in hook
    }
  }

  const handleAddPhotos = (files: FileList) => {
    const maxNew = 8 - existingPhotos.length - photoFiles.length
    const toAdd = Array.from(files).slice(0, maxNew)
    const newPreviews = toAdd.map(f => URL.createObjectURL(f))
    setPhotoFiles(prev => [...prev, ...toAdd])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  const handleRemovePending = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx])
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
    if (coverIdx === idx) setCoverIdx(0)
  }

  const handleRemoveExisting = async (photo: RecipePhoto) => {
    try {
      await deletePhotoRecord(photo.id, photo.storage_path)
      setExistingPhotos(prev => prev.filter(p => p.id !== photo.id))
    } catch {
      toast.error('Error al eliminar foto')
    }
  }

  const difficulty = watch('difficulty')

  const sections = [
    { key: 'info', label: 'Info' },
    { key: 'ingredients', label: 'Ingredientes' },
    { key: 'steps', label: 'Pasos' },
    { key: 'notes', label: 'Notas' },
    { key: 'photos', label: `Fotos ${existingPhotos.length + photoFiles.length > 0 ? `(${existingPhotos.length + photoFiles.length})` : ''}` },
  ] as const

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div aria-hidden style={{ height: 'env(safe-area-inset-top)' }} />
        <div className="flex items-center gap-3 px-4 h-14">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft size={22} style={{ color: 'var(--text)' }} />
            </button>
            <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <Home size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
          <h1 className="flex-1 font-semibold text-base" style={{ color: 'var(--text)' }}>
            {isEdit ? 'Editar receta' : 'Nueva receta'}
          </h1>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#e8572a' }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div
        className="sticky z-30 flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top))', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setCurrentSection(s.key)}
            className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{
              background: currentSection === s.key ? '#e8572a' : 'var(--surface-2)',
              color: currentSection === s.key ? 'white' : 'var(--text-muted)',
              border: currentSection === s.key ? 'none' : '1px solid var(--border)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-nav space-y-5">

        {/* ─── INFO ─────────────────────────────────────────── */}
        {currentSection === 'info' && (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Nombre de la receta *
              </label>
              <input
                {...register('title')}
                className="input-base"
                placeholder="Ej. Tarta de manzana"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Descripción corta
              </label>
              <textarea
                {...register('description')}
                className="input-base resize-none"
                rows={2}
                placeholder="Una breve descripción de la receta..."
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('category', key as Category)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: watch('category') === key ? `${cat.color}22` : 'var(--surface-2)',
                      color: watch('category') === key ? cat.color : 'var(--text-muted)',
                      border: `1px solid ${watch('category') === key ? cat.color + '66' : 'var(--border)'}`,
                    }}
                  >
                    {cat.emoji} {cat.label.split('&')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Dificultad
              </label>
              <div className="flex gap-2">
                {([
                  { v: 1, label: '⭐ Fácil', color: '#22c55e' },
                  { v: 2, label: '⭐⭐ Media', color: '#f59e0b' },
                  { v: 3, label: '⭐⭐⭐ Difícil', color: '#ef4444' },
                ] as const).map(({ v, label, color }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('difficulty', v)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: difficulty === v ? `${color}22` : 'var(--surface-2)',
                      color: difficulty === v ? color : 'var(--text-muted)',
                      border: `1px solid ${difficulty === v ? color + '66' : 'var(--border)'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Times & Servings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Porciones
                </label>
                <input
                  {...register('servings')}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  enterKeyHint="next"
                  className="input-base"
                  placeholder="4"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Prep (min)
                </label>
                <input
                  {...register('prep_time')}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  enterKeyHint="next"
                  className="input-base"
                  placeholder="15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Cocción (min)
                </label>
                <input
                  {...register('cook_time')}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  enterKeyHint="next"
                  className="input-base"
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Reposo (min)
                </label>
                <input
                  {...register('rest_time')}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  enterKeyHint="done"
                  className="input-base"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Etiquetas
              </label>
              <TagInput tags={tags} onChange={setTags} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Enter o coma para añadir
              </p>
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Receta pública</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cualquiera con el link puede verla</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('is_public', !watch('is_public'))}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{ background: watch('is_public') ? '#e8572a' : 'var(--border)' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: watch('is_public') ? '1.625rem' : '0.25rem' }}
                />
              </button>
            </div>
          </div>
        )}

        {/* ─── INGREDIENTS ──────────────────────────────────── */}
        {currentSection === 'ingredients' && (
          <div className="space-y-3">
            {ingredientFields.map((field, idx) => (
              <div key={field.id} className="card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} style={{ color: 'var(--border)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => idx > 0 && moveIngredient(idx, idx - 1)}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => idx < ingredientFields.length - 1 && moveIngredient(idx, idx + 1)}
                      disabled={idx === ingredientFields.length - 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <input
                  {...register(`ingredients.${idx}.name`)}
                  enterKeyHint="next"
                  className="input-base"
                  placeholder="Ingrediente *"
                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 320)}
                />
                {errors.ingredients?.[idx]?.name && (
                  <p className="text-xs text-red-500">Requerido</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    {...register(`ingredients.${idx}.amount`)}
                    inputMode="decimal"
                    enterKeyHint="next"
                    className="input-base"
                    placeholder="Cantidad"
                    onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 320)}
                  />
                  <UnitInput
                    value={watch(`ingredients.${idx}.unit`) ?? ''}
                    onChange={val => setValue(`ingredients.${idx}.unit`, val)}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendIngredient({ name: '', amount: '', unit: '', order_index: ingredientFields.length })}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ background: 'rgba(232,87,42,0.1)', color: '#e8572a', border: '1px dashed rgba(232,87,42,0.4)' }}
            >
              <Plus size={16} />
              Añadir ingrediente
            </button>
          </div>
        )}

        {/* ─── STEPS ────────────────────────────────────────── */}
        {currentSection === 'steps' && (
          <div className="space-y-3">
            {stepFields.map((field, idx) => (
              <div key={field.id} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#e8572a' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => idx > 0 && moveStep(idx, idx - 1)}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => idx < stepFields.length - 1 && moveStep(idx, idx + 1)}
                      disabled={idx === stepFields.length - 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <textarea
                  {...register(`steps.${idx}.content`)}
                  className="input-base resize-none"
                  rows={3}
                  placeholder={`Describe el paso ${idx + 1}...`}
                  onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 320)}
                />
                {errors.steps?.[idx]?.content && (
                  <p className="text-xs text-red-500">Requerido</p>
                )}

                <div className="flex items-center gap-2">
                  <Timer size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    {...register(`steps.${idx}.timer_minutes`)}
                    type="number"
                    min={0}
                    className="input-base flex-1"
                    placeholder="Timer (minutos, opcional)"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendStep({ content: '', timer_minutes: null, order_index: stepFields.length })}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'rgba(232,87,42,0.1)', color: '#e8572a', border: '1px dashed rgba(232,87,42,0.4)' }}
            >
              <Plus size={16} />
              Añadir paso
            </button>
          </div>
        )}

        {/* ─── NOTES ────────────────────────────────────────── */}
        {currentSection === 'notes' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Notas del chef
            </label>
            <textarea
              {...register('notes')}
              className="input-base resize-none"
              rows={10}
              placeholder="Tips, variaciones, sustituciones de ingredientes, maridajes..."
            />
          </div>
        )}

        {/* ─── PHOTOS ───────────────────────────────────────── */}
        {currentSection === 'photos' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Fotos de la receta
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Máximo 8 fotos · Toca ★ para definir la portada
              </p>
            </div>

            {/* Existing photos (edit mode) */}
            {existingPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fotos guardadas</p>
                <div className="flex flex-wrap gap-2">
                  {existingPhotos.map(photo => (
                    <div key={photo.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExisting(photo)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                      {photo.is_cover && (
                        <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#e8572a' }}>
                          <Star size={11} className="text-white" fill="white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending new photos */}
            {photoPreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Nuevas (se suben al guardar)
                </p>
                <div className="flex flex-wrap gap-2">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <button
                        type="button"
                        onClick={() => handleRemovePending(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverIdx(idx)}
                        className="absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: coverIdx === idx ? '#e8572a' : 'rgba(0,0,0,0.6)' }}
                        title="Portada"
                      >
                        <Star size={11} className="text-white" fill={coverIdx === idx ? 'white' : 'none'} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add photos button */}
            {existingPhotos.length + photoFiles.length < 8 && (
              <label
                className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-2xl cursor-pointer transition-colors"
                style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
              >
                <Camera size={28} />
                <span className="text-sm font-medium">Seleccionar fotos</span>
                <span className="text-xs">
                  {8 - existingPhotos.length - photoFiles.length} disponibles
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleAddPhotos(e.target.files)}
                />
              </label>
            )}

            {existingPhotos.length + photoFiles.length === 0 && (
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Las fotos se subirán automáticamente al presionar Guardar.
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
