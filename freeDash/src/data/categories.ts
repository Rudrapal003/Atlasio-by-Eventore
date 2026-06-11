import type { Category } from '@/types';

/* =========================================================
   Vendor categories shown on the right rail + map markers.
   The hex values must match the --c-* tokens in tokens.css.
   ========================================================= */

export const CATEGORIES: Category[] = [
  { id: 'venue',     label: 'Venues',         hex: '#1F4E79', cssVar: '--c-venue',     letter: 'V' },
  { id: 'photo',     label: 'Photography',    hex: '#F59E0B', cssVar: '--c-photo',     letter: 'P' },
  { id: 'catering',  label: 'Catering',       hex: '#E11D48', cssVar: '--c-catering',  letter: 'C' },
  { id: 'florals',   label: 'Florals',        hex: '#10B981', cssVar: '--c-florals',   letter: 'F' },
  { id: 'dj',        label: 'DJ / Music',     hex: '#8B5CF6', cssVar: '--c-dj',        letter: 'D' },
  { id: 'planning',  label: 'Planning',       hex: '#06B6D4', cssVar: '--c-planning',  letter: 'L' },
  { id: 'cake',      label: 'Cake / Dessert', hex: '#EC4899', cssVar: '--c-cake',      letter: 'K' },
  { id: 'beauty',    label: 'Hair / Makeup',  hex: '#C9A227', cssVar: '--c-beauty',    letter: 'B' },
  { id: 'officiant', label: 'Officiant',      hex: '#6366F1', cssVar: '--c-officiant', letter: 'O' },
];

export const catById = (id: string) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
