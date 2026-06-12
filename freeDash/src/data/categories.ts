import type { Category } from '@/types';

/* =========================================================
   Vendor categories — emoji on markers + accent color in CSS.
   Hex values must match the --c-* tokens in tokens.css.
   ========================================================= */

export const CATEGORIES: Category[] = [
  { id: 'venue',     label: 'Venues',         hex: '#1F4E79', cssVar: '--c-venue',     letter: 'V', emoji: '🏛️' },
  { id: 'photo',     label: 'Photography',    hex: '#F59E0B', cssVar: '--c-photo',     letter: 'P', emoji: '📷' },
  { id: 'catering',  label: 'Catering',       hex: '#E11D48', cssVar: '--c-catering',  letter: 'C', emoji: '🍽️' },
  { id: 'florals',   label: 'Florals',        hex: '#10B981', cssVar: '--c-florals',   letter: 'F', emoji: '💐' },
  { id: 'dj',        label: 'DJ / Music',     hex: '#8B5CF6', cssVar: '--c-dj',        letter: 'D', emoji: '🎧' },
  { id: 'planning',  label: 'Planning',       hex: '#06B6D4', cssVar: '--c-planning',  letter: 'L', emoji: '📋' },
  { id: 'cake',      label: 'Cake / Dessert', hex: '#EC4899', cssVar: '--c-cake',      letter: 'K', emoji: '🎂' },
  { id: 'beauty',    label: 'Hair / Makeup',  hex: '#C9A227', cssVar: '--c-beauty',    letter: 'B', emoji: '💄' },
  { id: 'officiant', label: 'Officiant',      hex: '#6366F1', cssVar: '--c