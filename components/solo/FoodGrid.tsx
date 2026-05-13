import Image from 'next/image'
import type { Food } from '@/lib/types'

interface FoodGridProps {
  foods: Food[]
  reaction: 'like' | 'dislike'
  onRemove?: (foodId: string) => void
  emptyMessage?: string
}

export default function FoodGrid({ foods, reaction, onRemove, emptyMessage }: FoodGridProps) {
  if (foods.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <div className="text-5xl mb-3">{reaction === 'like' ? '❤️' : '😶'}</div>
        <p className="text-lg font-medium">
          {emptyMessage || (reaction === 'like'
            ? 'No liked foods yet — start swiping!'
            : 'No disliked foods yet')}
        </p>
        <p className="text-sm mt-1">Head to Explore to rate some food</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {foods.map((food) => (
        <div key={food.id} className="card overflow-hidden group relative">
          <div className="relative aspect-square bg-stone-100">
            <Image
              src={food.image_url}
              alt={food.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={60}
            />
            {/* Reaction badge */}
            <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md ${
              reaction === 'like' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {reaction === 'like' ? '👍' : '👎'}
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm text-stone-900 truncate">{food.name}</p>
            {food.category && (
              <p className="text-xs text-stone-400 mt-0.5">{food.category}</p>
            )}
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(food.id)}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="bg-white text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                Remove
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
