import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExpenseEntry, ExpenseLabel } from '@/types';

/* =========================================================
   useExpenses — planner-logged actuals per vendor.
   Same localStorage pattern as the other fd_ hooks.

   The data is also the raw material for the crowdsourced
   pricing dataset we'll send to fd_vendor_expenses on
   Supabase (via lib/tracking.ts) once env is configured.
   ========================================================= */

const KEY = 'fd_expenses_v1';

function load(): ExpenseEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ExpenseEntry[]) : [];
  } catch {
    return [];
  }
}

function save(list: ExpenseEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota — ignore */
  }
}

function newId(): string {
  return 'x_' + Math.random().toString(36).slice(2, 10);
}

export interface AddExpenseInput {
  vendorId: string;
  amount: number;
  label: ExpenseLabel;
  spentOn: string;
  note?: string;
}

export interface UseExpensesApi {
  expenses: ExpenseEntry[];
  total: number;
  byVendor: (vendorId: string) => ExpenseEntry[];
  totalForVendor: (vendorId: string) => number;
  add: (input: AddExpenseInput) => ExpenseEntry;
  remove: (id: string) => void;
}

export function useExpenses(): UseExpensesApi {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => load());

  useEffect(() => { save(expenses); }, [expenses]);

  const add = useCallback((input: AddExpenseInput): ExpenseEntry => {
    const entry: ExpenseEntry = {
      id: newId(),
      vendorId: input.vendorId,
      amount: Math.max(0, Math.round(input.amount)),
      label: input.label,
      spentOn: input.spentOn,
      note: input.note ?? '',
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, entry]);
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const total = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );

  const byVendor = useCallback(
    (vendorId: string) => expenses.filter((e) => e.vendorId === vendorId),
    [expenses],
  );

  const totalForVendor = useCallback(
    (vendorId: string) =>
      expenses
        .filter((e) => e.vendorId === vendorId)
        .reduce((s, e) => s + e.amount, 0),
    [expenses],
  );

  return useMemo(
    () => ({ expenses, total, byVendor, totalForVendor, add, remove }),
    [expenses, total, byVendor, totalForVendor, add, remove],
  );
}

/* =========================================================
   Pre-set labels rendered in the form's <select>. The label
   doubles as the category aggregation key when this data
   pushes up to fd_vendor_expenses for crowdsourced pricing.
   ========================================================= */
export const EXPENSE_LABELS: { id: ExpenseLabel; label: string }[] = [
  { id: 'deposit',          label: 'Deposit' },
  { id: 'progress-payment', label: 'Progress Payment' },
  { id: 'final-payment',    label: 'Final Payment' },
  { id: 'tasting',          label: 'Tasting / Trial' },
  { id: 'consultation',     label: 'Consultation' },
  { id: 'travel-fee',       label: 'Travel Fee' },
  { id: 'add-on',           label: 'Add-On' },
  { id: 'other',            label: 'Other' },
];
