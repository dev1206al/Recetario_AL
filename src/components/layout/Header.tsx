import { Sun, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
}

export default function Header({ title, right }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
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
        {/* Visible solo en tablet/desktop — en móvil está en el BottomNav */}
        <button
          onClick={toggle}
          className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={16} style={{ color: 'var(--text-muted)' }} />
            : <Moon size={16} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
      </div>
    </header>
  )
}
