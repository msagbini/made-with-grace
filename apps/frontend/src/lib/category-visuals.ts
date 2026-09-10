import { IconKind } from '@/components/CategoryIcon';

export interface CategoryVisual {
  icon: IconKind;
  gradient: string;
}

const VISUALS_BY_SLUG: Record<string, CategoryVisual> = {
  'galletas-mensaje': { icon: 'message', gradient: 'from-amber-200 to-orange-300' },
  'galletas-foto': { icon: 'photo', gradient: 'from-pink-200 to-rose-300' },
  'galletas-tematicas': { icon: 'themed', gradient: 'from-violet-200 to-fuchsia-300' },
  'pack-mixto': { icon: 'mixed', gradient: 'from-yellow-200 to-amber-300' },
};

const FALLBACK_VISUALS: CategoryVisual[] = [
  { icon: 'cookie', gradient: 'from-amber-200 to-orange-300' },
  { icon: 'cupcake', gradient: 'from-pink-200 to-rose-300' },
  { icon: 'cake', gradient: 'from-violet-200 to-fuchsia-300' },
  { icon: 'donut', gradient: 'from-yellow-200 to-amber-300' },
];

export function getCategoryVisual(slug: string, index = 0): CategoryVisual {
  return VISUALS_BY_SLUG[slug] || FALLBACK_VISUALS[index % FALLBACK_VISUALS.length];
}
