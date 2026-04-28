import { Home, Plus, LogOut, Sun, Moon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function BottomNav() {
  const { signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const active = (path: string) => location.pathname === path

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around px-2 md:hidden"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        /* El nav tiene 4rem de contenido + el safe area del home indicator */
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Inicio */}
      <Link
        to="/"
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
        style={{ color: active('/') ? '#e8572a' : 'var(--text-muted)' }}
      >
        <Home size={22} />
        <span className="text-xs font-medium">Inicio</span>
      </Link>

      {/* Nueva receta — FAB elevado */}
      <Link
        to="/recipes/new"
        className="flex flex-col items-center gap-0.5 px-3 pb-2 rounded-xl transition-colors"
        style={{ color: active('/recipes/new') ? '#e8572a' : 'var(--text-muted)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-5 shadow-lg"
          style={{ background: '#e8572a' }}
        >
          <Plus size={24} className="text-white" />
        </div>
        <span className="text-xs font-medium mt-0.5">Nueva</span>
      </Link>

      {/* Dark / Light mode */}
      <button
        onClick={toggle}
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        <span className="text-xs font-medium">
          {theme === 'dark' ? 'Claro' : 'Oscuro'}
        </span>
      </button>

      {/* Cerrar sesión */}
      <button
        onClick={handleSignOut}
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <LogOut size={22} />
        <span className="text-xs font-medium">Salir</span>
      </button>
    </nav>
  )
}
