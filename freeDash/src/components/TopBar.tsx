import { CheckSquare, MapPin, Menu, Search, SlidersHorizontal } from 'lucide-react';
import type { AvatarTone, BudgetState } from '@/types';
import { BudgetThermometer } from './BudgetThermometer';
import styles from './TopBar.module.css';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  planCount: number;
  onTogglePlan: () => void;
  budget: BudgetState;
  spentByCategory: Record<string, number>;
  totalSpent: number;
  onBudgetTotal: (n: number) => void;
  userInitial: string;
  userTone: AvatarTone;
  onAvatarClick: () => void;
  onMenu: () => void;
  onFilter: () => void;
  /** New: opens the location / city picker */
  onLocationClick: () => void;
  /** New: current city label to display in the pill */
  cityName?: string;
}

const TONE_GRADIENT: Record<AvatarTone, { from: string; to: string }> = {
  gold:   { from: '#E8B931', to: '#C9A227' },
  brand:  { from: '#2E6FB0', to: '#1F4E79' },
  rose:   { from: '#FB7185', to: '#E11D48' },
  green:  { from: '#34D399', to: '#059669' },
  violet: { from: '#A78BFA', to: '#8B5CF6' },
  amber:  { from: '#FBBF24', to: '#D97706' },
};

export function TopBar({
  query, onQuery,
  planCount, onTogglePlan,
  budget, spentByCategory, totalSpent, onBudgetTotal,
  userInitial, userTone, onAvatarClick,
  onMenu, onFilter,
  onLocationClick, cityName,
}: Props) {
  const grad = TONE_GRADIENT[userTone] ?? TONE_GRADIENT.gold;
  return (
    <div className={styles.topbar}>
      <button
        className={`${styles.iconBtn} ${styles.mobileOnly} floatCard`}
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className={`${styles.brandCard} floatCard`}>
        <span className={styles.brandMark}>
          atlas<span className={styles.brandAccent}>io</span>
        </span>
        <span className={styles.brandSub}>by Eventore</span>
      </div>

      {/* Location pill — now clickable */}
      <button
        className={`${styles.locPill} floatCard ${styles.desktopOnly}`}
        type="button"
        title="Change city or location"
        onClick={onLocationClick}
      >
        <MapPin size={14} color="var(--rose)" />
        {cityName || 'Set location'}
      </button>

      <div className={`${styles.searchCard} floatCard`}>
        <Search size={16} color="var(--muted)" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search vendors, areas…"
          aria-label="Search vendors"
        />
      </div>

      <div className={styles.desktopOnly}>
        <BudgetThermometer
          budget={budget}
          spentByCategory={spentByCategory}
          totalSpent={totalSpent}
          onEditTotal={onBudgetTotal}
        />
      </div>

      <div className={styles.spacer} />

      <button
        className={`${styles.iconBtn} ${styles.mobileOnly} floatCard`}
        onClick={onFilter}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={18} />
      </button>

      <button className={styles.planBtn} onClick={onTogglePlan} type="button">
        <CheckSquare size={14} />
        <span className={styles.planLbl}>My Plan</span>
        <span className={styles.badge}>{planCount}</span>
      </button>

      <button
        className={styles.avatar}
        onClick={onAvatarClick}
        title="Open settings"
        style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
      >
        {userInitial}
      </button>
    </div>
  );
}
