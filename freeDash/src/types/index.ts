/* =========================================================
   atlasio — shared TypeScript types
   ========================================================= */

export type CategoryId =
  | 'venue'
  | 'photo'
  | 'catering'
  | 'florals'
  | 'dj'
  | 'planning'
  | 'cake'
  | 'beauty'
  | 'officiant';

export interface Category {
  id: CategoryId;
  label: string;
  /** CSS color — actual hex value (used inline). */
  hex: string;
  /** CSS var fallback name. */
  cssVar: string;
  /** Single-letter glyph (legacy; kept for fallback). */
  letter: string;
  /** Emoji shown on the map marker + category buttons. */
  emoji: string;
}

export interface VendorQuote {
  /** "100 guests / full evening" */
  tier: string;
  /** "$8,400" — formatted CAD string. */
  amount: string;
}

export interface Vendor {
  id: string;
  name: string;
  cat: CategoryId;
  lat: number;
  lng: number;
  area: string;
  /** 1 = $, 4 = $$$$. */
  price: 1 | 2 | 3 | 4;
  rating: number;
  brief: string;
  email: string;
  phone: string;
  web: string;
  quotes: VendorQuote[];
  /** Monetization (a) — sponsored placement; true sorts first within its category. */
  sponsored?: boolean;
  /** ISO date — auto-clear sponsored flag when expired. */
  sponsoredUntil?: string;
  /** Monetization (b) — affiliate-tracked outbound URL. If absent or null, fall back to `web`. */
  outboundUrl?: string | null;
}

export type StageId =
  | 'researched'
  | 'contacted'
  | 'quoted'
  | 'booked'
  | 'confirmed';

export interface Stage {
  id: StageId;
  label: string;
}

export type ChecklistKey =
  | 'review-portfolio'
  | 'send-inquiry'
  | 'request-quote'
  | 'compare-quote'
  | 'sign-contract'
  | 'deposit-paid'
  | 'final-confirm';

export interface VendorPlanEntry {
  stage: StageId;
  checks: Record<ChecklistKey, boolean>;
  notes: string;
  /** ISO timestamp of when this vendor was added. */
  addedAt: string;
}

export type Plan = Record<string, VendorPlanEntry>;

export interface BudgetState {
  total: number;
  spent: number;
}

export type BudgetCategoryAllocation = Partial<Record<CategoryId, number>>;

export interface FilterState {
  query: string;
  selectedCats: CategoryId[];
  priceTiers: number[];
  minRating: number;
  distKm: number;
  showOnlyInPlan: boolean;
}

/** Available avatar tints — pulled from Eventore palette. */
export type AvatarTone = 'gold' | 'brand' | 'rose' | 'green' | 'violet' | 'amber';

export interface UserProfile {
  name: string;
  email: string;
  /** Single-letter or two-letter glyph shown on the avatar. */
  initial: string;
  tone: AvatarTone;
}

export interface EventEntry {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  guestCount: number;
  locationLabel: string;
  notes: string;
  createdAt: string;
}

/** Pre-set expense labels — keeps category data clean for aggregation. */
export type ExpenseLabel =
  | 'deposit'
  | 'progress-payment'
  | 'final-payment'
  | 'tasting'
  | 'consultation'
  | 'travel-fee'
  | 'add-on'
  | 'other';

export interface ExpenseEntry {
  id: string;
  vendorId: string;
  /** Whole CAD dollars (we don't track cents in v1). */
  amount: number;
  label: ExpenseLabel;
  /** ISO date (YYYY-MM-DD). */
  spentOn: string;
  /** Free-form one-liner. */
  note: string;
  createdAt: string;
}
