import { useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    setVisible(false)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    prevPath.current = location.pathname
    return () => cancelAnimationFrame(t)
  }, [location.pathname])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 180ms ease',
        minHeight: '100dvh',
      }}
    >
      {children}
    </div>
  )
}
