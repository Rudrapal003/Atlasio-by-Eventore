import { CheckSquare, MapPin, Search } from 'lucide-react';
import type { BudgetState, Plan, Vendor } from '@/types';
import { BudgetThermometer } from './BudgetThermometer';
import styles from './TopBar.module.css';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  planCount: number;
  onTogglePlan: () => void;
  budget: BudgetState;
  plan: Plan;
  vendors: Vendor[];
  onBudgetTotal: (n: number) => void;
  userInitial: string;
}

export function TopBar({
  query, onQuery,
  planCount, onTogglePlan,
  budget, plan, vendors, onBudgetTotal,
  userInitial,
}: Props) {
  return (
    <div className={styles.topbar}>
      <div className={`${styles.brandCard} floatCard`}>
        <span className={styles.brandMark}>
          <span className={styles.free}>free</span>Dash
        </span>
        <span className={styles.brandSub}>by Eventore</span>
      </div>

      <button className={`${styles.locPill} floatCard`} type="button" title="Change city">
        <MapPin size={14} color="var(--rose)" />
        Greater Vancouver
      </button>

      <div className={`${styles.searchCard} floatCard`}>
        <Search size={16} color="var(--muted)" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search vendors, areas, styles…"
          aria-label="Search vendors"
        />
      </div>

      <BudgetThermometer
        budget={budget}
        plan={plan}
        vendors={vendors}
        onEditTotal={onBudgetTotal}
      />

      <div className={styles.spacer} />

      <button className={styles.planBtn} onClick={onTogglePlan} type="button">
        <CheckSquare size={14} />
        My Plan
        <span className={styles.badge}>{planCount}</span>
      </button>

      <div className={styles.avatar} title={`Signed in as ${userInitial}`}>
        {userInitial}
      </div>
    </div>
  );
}
