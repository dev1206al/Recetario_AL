import type { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
  headerTitle?: string
  headerRight?: ReactNode
  hideBottomNav?: boolean
}

export default function Layout({ children, headerTitle, headerRight, hideBottomNav }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)' }}>
      <Header title={headerTitle} right={headerRight} />
      <main className={hideBottomNav ? 'flex-1' : 'flex-1 pb-nav'}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  )
}
