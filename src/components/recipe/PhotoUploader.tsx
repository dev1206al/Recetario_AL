import { useRef, useState } from 'react'
import { Camera, X, Star } from 'lucide-react'
import type { RecipePhoto } from '../../types'
import { deletePhotoRecord, uploadPhoto, savePhotoRecord } from '../../hooks/useRecipes'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

interface PhotoUploaderProps {
  recipeId: string
  photos: RecipePhoto[]
  onPhotosChange: (photos: RecipePhoto[]) => void
  maxPhotos?: number
}

export default function PhotoUploader({
  recipeId,
  photos,
  onPhotosChange,
  maxPhotos = 8,
}: PhotoUploaderProps) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList) => {
    if (!user) return
    const remaining = maxPhotos - photos.length
    const toUpload = Array.from(files).slice(0, remaining)

    if (toUpload.length === 0) {
      toast.error(`Máximo ${maxPhotos} fotos`)
      return
    }

    setUploading(true)
    try {
      const newPhotos: RecipePhoto[] = []
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i]
        const { path, url } = await uploadPhoto(file, user.id, recipeId)
        const isCover = photos.length === 0 && i === 0
        const orderIndex = photos.length + i
        await savePhotoRecord(recipeId, path, url, isCover, orderIndex)
        newPhotos.push({
          id: `temp-${Date.now()}-${i}`,
          recipe_id: recipeId,
          storage_path: path,
          url,
          is_cover: isCover,
          order_index: orderIndex,
          created_at: new Date().toISOString(),
        } as RecipePhoto & { created_at: string })
      }
      onPhotosChange([...photos, ...newPhotos])
      toast.success(`${toUpload.length} foto(s) subida(s)`)
    } catch (e) {
      toast.error('Error al subir fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo: RecipePhoto) => {
    try {
      await deletePhotoRecord(photo.id, photo.storage_path)
      const updated = photos.filter(p => p.id !== photo.id)
      // If deleted was cover, make first remaining photo the cover
      if (photo.is_cover && updated.length > 0) {
        updated[0] = { ...updated[0], is_cover: true }
      }
      onPhotosChange(updated)
    } catch {
      toast.error('Error al eliminar foto')
    }
  }

  const setCover = async (photoId: string) => {
    onPhotosChange(
      photos.map(p => ({ ...p, is_cover: p.id === photoId }))
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
            <button
              type="button"
              onClick={() => setCover(photo.id)}
              className="absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-opacity"
              style={{
                background: photo.is_cover ? '#e8572a' : 'rgba(0,0,0,0.6)',
                opacity: photo.is_cover ? 1 : undefined,
              }}
              title="Portada"
            >
              <Star size={11} className="text-white" fill={photo.is_cover ? 'white' : 'none'} />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
            style={{ border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera size={20} />
                <span className="text-xs">Añadir</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {photos.length}/{maxPhotos} fotos · Toca ★ para definir portada
      </p>
    </div>
  )
}
