import { Sun, Moon, Plus, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

interface HeaderProps {
  title?: string
  right?: React.ReactNode
}

export default function Header({ title, right }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: 'linear-gradient(to bottom, var(--surface) 70%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Spacer que "absorbe" la barra de status en modo standalone */}
      <div aria-hidden style={{ height: 'env(safe-area-inset-top)' }} />

      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        {title ? (
          <h1 className="font-semibold text-base truncate max-w-[60%]" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
        ) : (
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src="/logo-al.svg" alt="Recetario AL" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>
              Recetario <span className="text-accent">AL</span>
            </span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {right}

          {/* Desktop-only nav actions */}
          <Link
            to="/recipes/new"
            className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#e8572a' }}
          >
            <Plus size={16} />
            Nueva
          </Link>
          <button
            onClick={handleSignOut}
            className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          <button
            onClick={toggle}
            className="flex w-9 h-9 rounded-xl items-center justify-center transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--text-muted)' }} />
              : <Moon size={16} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>
      </div>
    </header>
  )
}
