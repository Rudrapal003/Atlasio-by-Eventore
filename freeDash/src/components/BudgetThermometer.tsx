import { CATEGORIES } from '@/data/categories';
import type { BudgetState } from '@/types';
import { fmtCAD } from '@/lib/format';
import styles from './BudgetThermometer.module.css';

interface Props {
  budget: BudgetState;
  /** CAD spent per CategoryId, computed by App from useExpenses. */
  spentByCategory: Record<string, number>;
  /** Total spent (sum of spentByCategory). */
  totalSpent: number;
  onEditTotal: (n: number) => void;
}

/**
 * Compact horizontal budget bar that sits in the top bar.
 * Segments are real now — they reflect the per-category sum of
 * planner-logged expenses (useExpenses + vendor.cat lookup).
 * Click anywhere on the card to edit the total via prompt(); the
 * Budget tab in Settings is the full editor.
 */
export function BudgetThermometer({
  budget, spentByCategory, totalSpent, onEditTotal,
}: Props) {
  const pct = budget.total > 0
    ? Math.min(100, Math.round((totalSpent / budget.total) * 100))
    : 0;
  const remaining = budget.total - totalSpent;

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
          <b>{fmtCAD(totalSpent)}</b> / {fmtCAD(budget.total)}
        </span>
      </div>
      <div className={styles.bar}>
        {totalSpent > 0 ? (
          CATEGORIES.map((c) => {
            const v = spentByCategory[c.id] ?? 0;
            if (v <= 0) return null;
            return (
              <span
                key={c.id}
                style={{ width: `${(v / budget.total) * 100}%`, background: c.hex }}
              />
            );
          })
        ) : (
          <span style={{ width: '0%', background: fillColor }} />
        )}
      </div>
      <div className={styles.foot}>
        <span className={remaining < 0 ? styles.over : undefined}>
          {remaining >= 0
            ? totalSpent === 0
              ? 'No expenses logged yet'
              : `${fmtCAD(remaining)} remaining`
            : `${fmtCAD(-remaining)} over`}
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
