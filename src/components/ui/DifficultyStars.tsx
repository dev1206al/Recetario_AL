interface DifficultyStarsProps {
  value: 1 | 2 | 3
  size?: number
}

const LABELS = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' }
const COLORS = { 1: '#22c55e', 2: '#f59e0b', 3: '#ef4444' }

export default function DifficultyStars({ value, size = 14 }: DifficultyStarsProps) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= value ? COLORS[value as 1 | 2 | 3] : 'var(--border)'}
            stroke="none"
          />
        </svg>
      ))}
      <span className="text-xs font-medium ml-0.5" style={{ color: COLORS[value as 1 | 2 | 3] }}>
        {LABELS[value as 1 | 2 | 3]}
      </span>
    </span>
  )
}
