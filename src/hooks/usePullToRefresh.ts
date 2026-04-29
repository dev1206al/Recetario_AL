import { useCallback, useEffect, useRef, useState } from 'react'

const THRESHOLD = 68

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullYRef = useRef(0)
  const activeRef = useRef(false)
  const refreshingRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || refreshingRef.current) return
    startYRef.current = e.touches[0].clientY
    activeRef.current = true
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!activeRef.current || refreshingRef.current) return
    const dy = e.touches[0].clientY - startYRef.current
    if (dy <= 0) { activeRef.current = false; return }
    const y = Math.min(THRESHOLD, dy * 0.48)
    pullYRef.current = y
    setPullY(y)
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (!activeRef.current) return
    activeRef.current = false
    if (pullYRef.current >= THRESHOLD * 0.85) {
      refreshingRef.current = true
      setRefreshing(true)
      setPullY(THRESHOLD)
      await onRefresh()
      refreshingRef.current = false
      setRefreshing(false)
    }
    pullYRef.current = 0
    setPullY(0)
  }, [onRefresh])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { pullY, refreshing, threshold: THRESHOLD }
}
