import { supabase } from './supabase';

/* =========================================================
   Outbound link tracking — supports monetization (b).
   Best-effort fire-and-forget. Never blocks the click.
   ========================================================= */

const FD_VISITOR_KEY = 'fd_visitor_id';

/** Random anonymous visitor id, persisted in localStorage. */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(FD_VISITOR_KEY);
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(FD_VISITOR_KEY, id);
  }
  return id;
}

interface OutboundEvent {
  vendorId: string;
  targetUrl: string;
  surface: 'vendor-card' | 'plan-drawer' | 'category-list';
  sponsored?: boolean;
}

/** Fire-and-forget — never throws. */
export async function trackOutboundClick(ev: OutboundEvent): Promise<void> {
  const enabled = import.meta.env.VITE_ENABLE_OUTBOUND_TRACKING !== 'false';
  if (!enabled) return;
  try {
    if (!supabase) return;
    await supabase.from('fd_outbound_clicks').insert({
      visitor_id: getVisitorId(),
      vendor_id: ev.vendorId,
      target_url: ev.targetUrl,
      surface: ev.surface,
      sponsored: !!ev.sponsored,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
    });
  } catch (err) {
    /* swallow — analytics must never break the UX */
    if (import.meta.env.DEV) console.warn('[fd:trackOutbound]', err);
  }
}

interface ExpenseLogEvent {
  vendorId: string;
  amount: number;
  label: string;
  spentOn: string;
}

/**
 * Crowdsourced pricing beacon. Each planner-logged expense becomes
 * one anonymous row that feeds the "average paid here" stats we'll
 * eventually surface on vendor cards — and the leverage we'll bring
 * to vendor outreach later ("here's what your customers actually
 * spent through us this year").
 *
 * Fire-and-forget. Never blocks the UI.
 */
export async function trackExpenseLog(ev: ExpenseLogEvent): Promise<void> {
  const enabled = import.meta.env.VITE_ENABLE_OUTBOUND_TRACKING !== 'false';
  if (!enabled) return;
  try {
    if (!supabase) return;
    await supabase.from('fd_vendor_expenses').insert({
      visitor_id: getVisitorId(),
      vendor_id: ev.vendorId,
      amount: ev.amount,
      label: ev.label,
      spent_on: ev.spentOn,
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[fd:trackExpense]', err);
  }
}

/**
 * Normalize a vendor's outbound URL.
 * - If outboundUrl is present, use it (affiliate-tracked link).
 * - Otherwise fall back to `web` with https://.
 */
export function resolveOutboundUrl(
  vendor: { web: string; outboundUrl?: string | null },
): string {
  if (vendor.outboundUrl) return vendor.outboundUrl;
  const web = vendor.web.replace(/^https?:\/\//, '');
  return 'https://' + web;
}
