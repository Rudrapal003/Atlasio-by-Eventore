import { CATEGORIES } from '@/data/categories';
import type { BudgetState, Plan, Vendor } from '@/types';
import { fmtCAD } from '@/lib/format';
import styles from './BudgetThermometer.module.css';

interface Props {
  budget: BudgetState;
  plan: Plan;
  vendors: Vendor[];
  onEditTotal: (n: number) => void;
}

/**
 * Compact horizontal budget bar that sits in the top bar.
 * Segments fill in proportional to vendors-in-plan by category,
 * which gives the planner a per-category mental model rather than
 * one undifferentiated total.
 *
 * Click anywhere on the card to edit the total via prompt(); the
 * dedicated "Budget" function tile in the left rail will replace
 * this with a real editor in v1.1.
 */
export function BudgetThermometer({ budget, plan, vendors, onEditTotal }: Props) {
  const planVendors = Object.keys(plan)
    .map((id) => vendors.find((v) => v.id === id))
    .filter((v): v is Vendor => Boolean(v));

  /** Allocate $1k * price-tier per plan vendor as a rough placeholder until
   *  the user logs real quote amounts inside the plan drawer. */
  const byCat: Record<string, number> = {};
  planVendors.forEach((v) => {
    byCat[v.cat] = (byCat[v.cat] ?? 0) + v.price * 1000;
  });
  const sumAllocated = Object.values(byCat).reduce((a, b) => a + b, 0);
  const effectiveSpent = Math.max(budget.spent, sumAllocated);

  const pct = budget.total > 0
    ? Math.min(100, Math.round((effectiveSpent / budget.total) * 100))
    : 0;
  const remaining = budget.total - effectiveSpent;

  const handleClick = () => {
    const next = prompt('Edit total budget (CAD):', String(budget.total));
    if (next == null) return;
    const n = parseInt(next.replace(/[^\d]/g, ''), 10);
    if (!Number.isNaN(n) && n > 0) onEditTotal(n);
  };

  const fillColor =
    pct > 90 ? 'var(--rose)' :
    pct > 75 ? 'var(--gold-bright)' :
              'var(--green-bright)';

  return (
    <div className={`${styles.budgetCard} floatCard`} onClick={handleClick} title="Click to edit budget">
      <div className={styles.head}>
        <span className={styles.label}>Budget</span>
        <span className={styles.amount}>
          <b>{fmtCAD(effectiveSpent)}</b> / {fmtCAD(budget.total)}
        </span>
      </div>
      <div className={styles.bar}>
        {sumAllocated > 0 ? (
          CATEGORIES.map((c) => {
            const v = byCat[c.id] ?? 0;
            if (v <= 0) return null;
            return (
              <span
                key={c.id}
                style={{ width: `${(v / budget.total) * 100}%`, background: c.hex }}
              />
            );
          })
        ) : (
          <span style={{ width: `${pct}%`, background: fillColor }} />
        )}
      </div>
      <div className={styles.foot}>
        <span className={remaining < 0 ? styles.over : undefined}>
          {remaining >= 0 ? `${fmtCAD(remaining)} remaining` : `${fmtCAD(-remaining)} over`}
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
