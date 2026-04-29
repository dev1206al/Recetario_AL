import toast from 'react-hot-toast'
import { Check, Copy, Share2 } from 'lucide-react'

const base: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  background: 'var(--surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
}

const icon = (bg: string, children: React.ReactNode) => (
  <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {children}
  </div>
)

export function toastCopied(message = 'Link copiado') {
  toast.custom(
    t => (
      <div style={{ ...base, opacity: t.visible ? 1 : 0, transition: 'opacity 200ms' }}>
        {icon('rgba(232,87,42,0.12)', <Copy size={14} color="#e8572a" />)}
        <span>{message}</span>
      </div>
    ),
    { duration: 2500 }
  )
}

export function toastShared() {
  toast.custom(
    t => (
      <div style={{ ...base, opacity: t.visible ? 1 : 0, transition: 'opacity 200ms' }}>
        {icon('rgba(34,197,94,0.12)', <Share2 size={14} color="#22c55e" />)}
        <span>Receta compartida</span>
      </div>
    ),
    { duration: 2500 }
  )
}

export function toastSaved(message = 'Guardado') {
  toast.custom(
    t => (
      <div style={{ ...base, opacity: t.visible ? 1 : 0, transition: 'opacity 200ms' }}>
        {icon('rgba(34,197,94,0.12)', <Check size={14} color="#22c55e" />)}
        <span>{message}</span>
      </div>
    ),
    { duration: 2500 }
  )
}
