export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      {/* Photo area */}
      <div className="skeleton" style={{ aspectRatio: '4/3', width: '100%' }} />
      {/* Info */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-4/5 rounded-full" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-3 w-12 rounded-full" />
          <div className="skeleton h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
