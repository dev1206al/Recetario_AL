import { Pause, Play, RotateCcw, X, Timer as TimerIcon } from 'lucide-react'
import type { TimerState } from '../../types'
import { formatTime } from '../../hooks/useTimer'

interface TimerPanelProps {
  timers: TimerState[]
  onToggle: (id: string) => void
  onReset: (id: string) => void
  onRemove: (id: string) => void
}

export default function TimerPanel({ timers, onToggle, onReset, onRemove }: TimerPanelProps) {
  if (timers.length === 0) return null

  return (
    <div className="space-y-2">
      {timers.map(timer => {
        const progress = timer.totalSeconds > 0
          ? (timer.remaining / timer.totalSeconds) * 100
          : 0

        return (
          <div
            key={timer.id}
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: timer.done
                ? 'rgba(34,197,94,0.1)'
                : timer.running
                ? 'rgba(232,87,42,0.08)'
                : 'var(--surface-2)',
              border: `1px solid ${timer.done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TimerIcon
                  size={16}
                  style={{ color: timer.done ? '#22c55e' : '#e8572a' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {timer.name}
                </span>
                {timer.done && (
                  <span className="text-xs font-semibold text-green-500">¡Listo!</span>
                )}
              </div>
              <button
                onClick={() => onRemove(timer.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: timer.done ? '#22c55e' : '#e8572a',
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: timer.done ? '#22c55e' : 'var(--text)' }}
              >
                {formatTime(timer.remaining)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReset(timer.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => onToggle(timer.id)}
                  disabled={timer.done}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                  style={{ background: '#e8572a' }}
                >
                  {timer.running
                    ? <Pause size={15} className="text-white" />
                    : <Play size={15} className="text-white" />
                  }
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
