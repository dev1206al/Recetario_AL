import { CATEGORIES, type Category } from '../../types'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const cat = CATEGORIES[category] ?? CATEGORIES['otros']

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'
      }`}
      style={{
        background: `${cat.color}22`,
        color: cat.color,
        border: `1px solid ${cat.color}44`,
      }}
    >
      <span>{cat.emoji}</span>
      {cat.label}
    </span>
  )
}
