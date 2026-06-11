import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Plan, VendorPlanEntry, ChecklistKey, StageId } from '@/types';

/* =========================================================
   usePlan — anonymous, localStorage-backed plan state.
   When auth lands later, sync this up to fd_plans on signup.
   ========================================================= */

const STORAGE_KEY = 'fd_plan_v1';

function load(): Plan {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Plan : {};
  } catch {
    return {};
  }
}

function save(plan: Plan) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    /* quota or private mode — ignore */
  }
}

function newEntry(): VendorPlanEntry {
  return {
    stage: 'researched',
    checks: {
      'review-portfolio': true,
      'send-inquiry': false,
      'request-quote': false,
      'compare-quote': false,
      'sign-contract': false,
      'deposit-paid': false,
      'final-confirm': false,
    },
    notes: '',
    addedAt: new Date().toISOString(),
  };
}

function deriveStage(checks: VendorPlanEntry['checks']): StageId {
  if (checks['final-confirm']) return 'confirmed';
  if (checks['deposit-paid'] || checks['sign-contract']) return 'booked';
  if (checks['compare-quote'] || checks['request-quote']) return 'quoted';
  if (checks['send-inquiry']) return 'contacted';
  return 'researched';
}

export interface UsePlanApi {
  plan: Plan;
  count: number;
  has: (vendorId: string) => boolean;
  toggle: (vendorId: string) => void;
  add: (vendorId: string) => void;
  remove: (vendorId: string) => void;
  toggleCheck: (vendorId: string, key: ChecklistKey) => void;
  setNotes: (vendorId: string, notes: string) => void;
  countsByStage: Record<StageId, number>;
}

export function usePlan(): UsePlanApi {
  const [plan, setPlan] = useState<Plan>(() => load());

  /* persist whenever the plan changes */
  useEffect(() => {
    save(plan);
  }, [plan]);

  const has = useCallback((id: string) => Boolean(plan[id]), [plan]);

  const add = useCallback((id: string) => {
    setPlan((p) => (p[id] ? p : { ...p, [id]: newEntry() }));
  }, []);

  const remove = useCallback((id: string) => {
    setPlan((p) => {
      if (!p[id]) return p;
      const next = { ...p };
      delete next[id];
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setPlan((p) => {
      if (p[id]) {
        const next = { ...p };
        delete next[id];
        return next;
      }
      return { ...p, [id]: newEntry() };
    });
  }, []);

  const toggleCheck = useCallback((id: string, key: ChecklistKey) => {
    setPlan((p) => {
      const entry = p[id];
      if (!entry) return p;
      const checks = { ...entry.checks, [key]: !entry.checks[key] };
      return {
        ...p,
        [id]: { ...entry, checks, stage: deriveStage(checks) },
      };
    });
  }, []);

  const setNotes = useCallback((id: string, notes: string) => {
    setPlan((p) => {
      const entry = p[id];
      if (!entry) return p;
      return { ...p, [id]: { ...entry, notes } };
    });
  }, []);

  const countsByStage = useMemo(() => {
    const c: Record<StageId, number> = {
      researched: 0, contacted: 0, quoted: 0, booked: 0, confirmed: 0,
    };
    Object.values(plan).forEach((e) => { c[e.stage]++; });
    return c;
  }, [plan]);

  return {
    plan,
    count: Object.keys(plan).length,
    has, toggle, add, remove,
    toggleCheck, setNotes,
    countsByStage,
  };
}
