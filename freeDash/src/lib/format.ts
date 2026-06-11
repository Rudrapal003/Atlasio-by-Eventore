/* =========================================================
   Small formatting helpers
   ========================================================= */

export const fmtCAD = (n: number): string =>
  '$' + n.toLocaleString('en-CA');

export const priceLabel = (tier: number): string =>
  '$'.repeat(tier);

export const stars = (n: number): string =>
  '★'.repeat(Math.floor(n)) + (n % 1 ? '½' : '') + ' ' + n.toFixed(1);

export function daysUntil(iso: string): number {
  const now = Date.now();
  const t = new Date(iso).getTime();
  return Math.max(0, Math.round((t - now) / (1000 * 60 * 60 * 24)));
}
