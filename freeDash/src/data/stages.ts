import type { Stage, ChecklistKey } from '@/types';

/* =========================================================
   Plan stages — derived from which checklist items are done.
   Order matters: the derivation walks down and picks the
   first match.
   ========================================================= */

export const STAGES: Stage[] = [
  { id: 'researched', label: 'Researched' },
  { id: 'contacted',  label: 'Contacted' },
  { id: 'quoted',     label: 'Quote received' },
  { id: 'booked',     label: 'Booked' },
  { id: 'confirmed',  label: 'Final-confirm (7d out)' },
];

export const CHECKLIST: { key: ChecklistKey; label: string }[] = [
  { key: 'review-portfolio', label: 'Reviewed portfolio' },
  { key: 'send-inquiry',     label: 'Sent first inquiry' },
  { key: 'request-quote',    label: 'Requested quote' },
  { key: 'compare-quote',    label: 'Compared 1+ vendor' },
  { key: 'sign-contract',    label: 'Contract signed' },
  { key: 'deposit-paid',     label: 'Deposit paid' },
  { key: 'final-confirm',    label: 'Final-confirm (7d out)' },
];

export const stageLabel = (id: string) =>
  STAGES.find((s) => s.id === id)?.label ?? '';
