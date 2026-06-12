import { useCallback, useEffect, useState } from 'react';
import type { BudgetCategoryAllocation, CategoryId } from '@/types';

/* =========================================================
   useBudgetCategories — per-category budget allocation.
   The top-bar thermometer falls back to plan-derived estimates
   when no allocation is set; this lets the user pin amounts.
   ========================================================= */

const KEY = 'fd_budget_cats_v1';

function load(): BudgetCategoryAllocation {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BudgetCategoryAllocation) : {};
  } catch {
    return {};
  }
}

export function useBudgetCategories() {
  const [alloc, setAlloc] = useState<BudgetCategoryAllocation>(() => load());

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(alloc)); } catch { /* quota */ }
  }, [alloc]);

  const setCategoryBudget = useCallback((cat: CategoryId, amount: number) => {
    setAlloc((prev) => ({ ...prev, [cat]: Math.max(0, Math.round(amount)) }));
  }, []);

  const clear = useCallback(() => setAlloc({}), []);

  return { alloc, setCategoryBudget, clear };
}
