const adjectives = [
  'pizza', 'crispy', 'golden', 'spicy', 'saucy', 'smoky',
  'sweet', 'tangy', 'fresh', 'zesty', 'creamy', 'crunchy',
]
const nouns = [
  'cloud', 'tiger', 'feast', 'table', 'fork', 'bowl',
  'plate', 'chef', 'bite', 'snack', 'grill', 'spoon',
]

export function generateGroupCode(): string {
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num  = Math.floor(Math.random() * 99) + 1
  return `${adj}-${noun}-${num}`
}

export function generateGuestName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const suffix = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  return `Guest_${suffix}`
}

export function generateAvatarColor(): string {
  const colors = [
    '#f97316', '#ef4444', '#8b5cf6', '#3b82f6',
    '#10b981', '#f59e0b', '#ec4899', '#06b6d4',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
