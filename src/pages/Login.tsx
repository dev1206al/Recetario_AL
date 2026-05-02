import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { session } = useAuth()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'register') {
      const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (clean.length < 3) {
        toast.error('El usuario debe tener al menos 3 caracteres (letras, números o _)')
        return
      }
      if (clean !== username.trim()) {
        toast.error('Solo se permiten letras, números y guión bajo')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('¡Bienvenido de vuelta!')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim().toLowerCase() } },
        })
        if (error) throw error
        toast.success('Cuenta creada. Revisa tu correo para confirmar.')
      }
    } catch (error: unknown) {
      const msg = (error as Error).message
      if (msg.includes('already registered')) toast.error('Este email ya está registrado')
      else if (msg.includes('Password')) toast.error('La contraseña debe tener al menos 6 caracteres')
      else toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <button
        onClick={toggle}
        className="fixed top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {theme === 'dark'
          ? <Sun size={16} style={{ color: 'var(--text-muted)' }} />
          : <Moon size={16} style={{ color: 'var(--text-muted)' }} />
        }
      </button>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <img src="/logo-al.svg" alt="Recetario AL" className="w-20 h-20 rounded-2xl mx-auto" />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Recetario <span style={{ color: '#e8572a' }}>AL</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tu cocina, tus recetas</p>
          </div>
        </div>

        <div className="card p-6 space-y-5">
          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? '#e8572a' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                  borderRadius: '0.75rem',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username — solo en registro */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Usuario
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium select-none"
                    style={{ color: 'var(--text-muted)' }}
                  >@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="input-base pl-8"
                    placeholder="mi_usuario"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    minLength={3}
                    maxLength={20}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Letras, números y _ · mínimo 3 caracteres
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-base"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#e8572a' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Creando cuenta...'}
                </span>
              ) : (
                mode === 'login' ? 'Entrar' : 'Crear cuenta'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
