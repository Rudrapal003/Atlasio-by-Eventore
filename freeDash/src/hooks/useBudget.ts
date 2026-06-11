import { useEffect, useState, useCallback } from 'react';
import type { BudgetState } from '@/types';

const KEY = 'fd_budget_v1';

const DEFAULT: BudgetState = { total: 25000, spent: 0 };

function load(): BudgetState {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useBudget() {
  const [budget, setBudget] = useState<BudgetState>(() => load());

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(budget)); } catch { /* quota */ }
  }, [budget]);

  const setTotal = useCallback((total: number) => {
    setBudget((b) => ({ ...b, total: Math.max(0, total) }));
  }, []);

  const setSpent = useCallback((spent: number) => {
    setBudget((b) => ({ ...b, spent: Math.max(0, spent) }));
  }, []);

  return { budget, setTotal, setSpent };
}
