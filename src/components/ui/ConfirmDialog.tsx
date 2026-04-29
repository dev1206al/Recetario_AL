import { useRef, useState } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)

  if (!open) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setDragY(dy)
  }

  const handleTouchEnd = () => {
    if (dragY > 80) {
      setDragY(0)
      onCancel()
    } else {
      setDragY(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: 'var(--surface)',
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />

        <h3 className="font-semibold text-base mt-2" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: danger ? '#ef4444' : '#e8572a' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
