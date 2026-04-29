import { useCallback, useEffect, useRef, useState } from 'react'
import type { TimerState } from '../types'
import { haptics } from '../lib/haptics'

let timerIdCounter = 0

export function useTimers() {
  const [timers, setTimers] = useState<TimerState[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    setTimers(prev =>
      prev.map(t => {
        if (!t.running || t.done) return t
        const next = t.remaining - 1
        if (next <= 0) {
          // Play a short beep via Web Audio API
          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.setValueAtTime(0.3, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
            osc.start()
            osc.stop(ctx.currentTime + 0.8)
          } catch { /* ignore */ }
          haptics.success()
          return { ...t, remaining: 0, running: false, done: true }
        }
        return { ...t, remaining: next }
      })
    )
  }, [])

  useEffect(() => {
    const hasRunning = timers.some(t => t.running)
    if (hasRunning && !intervalRef.current) {
      intervalRef.current = setInterval(tick, 1000)
    } else if (!hasRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [timers, tick])

  const addTimer = useCallback((name: string, minutes: number) => {
    timerIdCounter++
    setTimers(prev => [
      ...prev,
      {
        id: `timer-${timerIdCounter}`,
        name,
        totalSeconds: minutes * 60,
        remaining: minutes * 60,
        running: true,
        done: false,
      },
    ])
  }, [])

  const toggleTimer = useCallback((id: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === id && !t.done ? { ...t, running: !t.running } : t))
    )
  }, [])

  const resetTimer = useCallback((id: string) => {
    setTimers(prev =>
      prev.map(t => (t.id === id ? { ...t, remaining: t.totalSeconds, running: false, done: false } : t))
    )
  }, [])

  const removeTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAll = useCallback(() => setTimers([]), [])

  return { timers, addTimer, toggleTimer, resetTimer, removeTimer, clearAll }
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
