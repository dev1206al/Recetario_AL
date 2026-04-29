import { Home, Plus, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const active = (path: string) => location.pathname === path

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around px-2 md:hidden"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Link
        to="/"
        className="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors"
        style={{ color: active('/') ? '#e8572a' : 'var(--text-muted)' }}
      >
        <Home size={22} />
        <span className="text-xs font-medium">Inicio</span>
      </Link>

      <Link
        to="/recipes/new"
        className="flex flex-col items-center gap-0.5 px-5 pb-2 rounded-xl transition-colors"
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

      <Link
        to="/search"
        className="flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors"
        style={{ color: active('/search') ? '#e8572a' : 'var(--text-muted)' }}
      >
        <Search size={22} />
        <span className="text-xs font-medium">Buscar</span>
      </Link>
    </nav>
  )
}
