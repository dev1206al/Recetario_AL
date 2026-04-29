import { useCallback, useRef } from 'react'
import { haptics } from '../lib/haptics'

const DELAY = 480
const MOVE_THRESHOLD = 10

export function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    fired.current = false
    startPos.current = null
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    fired.current = false
    timerRef.current = setTimeout(() => {
      fired.current = true
      haptics.medium()
      onLongPress()
      timerRef.current = null
    }, DELAY)
  }, [onLongPress])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startPos.current || !timerRef.current) return
    const dx = Math.abs(e.touches[0].clientX - startPos.current.x)
    const dy = Math.abs(e.touches[0].clientY - startPos.current.y)
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) clear()
  }, [])

  const onTouchEnd = useCallback(() => {
    clear()
  }, [])

  return { onTouchStart, onTouchMove, onTouchEnd, didFire: () => fired.current }
}
