import { Home, Plus, LogOut } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function BottomNav() {
  const { signOut } = useAuth()
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
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 safe-bottom"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        height: 'calc(4rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Link
        to="/"
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
        style={{ color: active('/') ? '#e8572a' : 'var(--text-muted)' }}
      >
        <Home size={22} />
        <span className="text-xs font-medium">Inicio</span>
      </Link>

      <Link
        to="/recipes/new"
        className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors"
        style={{
          background: active('/recipes/new') ? 'rgba(232,87,42,0.15)' : 'transparent',
          color: active('/recipes/new') ? '#e8572a' : 'var(--text-muted)',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-6 shadow-lg"
          style={{ background: '#e8572a' }}
        >
          <Plus size={24} className="text-white" />
        </div>
        <span className="text-xs font-medium mt-0.5">Nueva</span>
      </Link>

      <button
        onClick={handleSignOut}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <LogOut size={22} />
        <span className="text-xs font-medium">Salir</span>
      </button>
    </nav>
  )
}
