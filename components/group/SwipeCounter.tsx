interface SwipeCounterProps {
  current: number
  limit: number
}

export default function SwipeCounter({ current, limit }: SwipeCounterProps) {
  const pct = Math.min(100, (current / limit) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium text-stone-600">Swipes</span>
        <span className="font-bold text-stone-800 tabular-nums">{current} / {limit}</span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
