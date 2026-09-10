export interface CategoryVisual {
  emoji: string;
  gradient: string;
}

const VISUALS_BY_SLUG: Record<string, CategoryVisual> = {
  'galletas-mensaje': { emoji: '💌', gradient: 'from-amber-200 to-orange-300' },
  'galletas-foto': { emoji: '📸', gradient: 'from-pink-200 to-rose-300' },
  'galletas-tematicas': { emoji: '🎉', gradient: 'from-violet-200 to-fuchsia-300' },
  'pack-mixto': { emoji: '🍪', gradient: 'from-yellow-200 to-amber-300' },
};

const FALLBACK_VISUALS: CategoryVisual[] = [
  { emoji: '🍪', gradient: 'from-amber-200 to-orange-300' },
  { emoji: '🧁', gradient: 'from-pink-200 to-rose-300' },
  { emoji: '🎂', gradient: 'from-violet-200 to-fuchsia-300' },
  { emoji: '🍩', gradient: 'from-yellow-200 to-amber-300' },
];

export function getCategoryVisual(slug: string, index = 0): CategoryVisual {
  return VISUALS_BY_SLUG[slug] || FALLBACK_VISUALS[index % FALLBACK_VISUALS.length];
}
