import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PageTransition from './components/layout/PageTransition'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Home from './pages/Home'
import SearchPage from './pages/SearchPage'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'
import CookMode from './pages/CookMode'
import PublicRecipe from './pages/PublicRecipe'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function PrivateRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5" style={{ background: 'var(--bg)' }}>
        <img src="/logo-al.svg" alt="Recetario AL" className="w-16 h-16 rounded-2xl" style={{ boxShadow: '0 4px 20px rgba(232,87,42,0.25)' }} />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#e8572a', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        <Route path="/r/:id" element={<PublicRecipe />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/recipes/new" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
        <Route path="/recipes/:id" element={<PrivateRoute><RecipeDetail /></PrivateRoute>} />
        <Route path="/recipes/:id/edit" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
        <Route path="/recipes/:id/cook" element={<PrivateRoute><CookMode /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>

          <Toaster
            position="bottom-center"
            containerStyle={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#e8572a', secondary: 'white' },
              },
            }}
          />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
