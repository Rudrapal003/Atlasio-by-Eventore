import { useState, useRef, useEffect } from 'react';
import { CheckSquare, MapPin, Menu, Search, SlidersHorizontal, X } from 'lucide-react';
import type { AvatarTone, BudgetState } from '@/types';
import { BudgetThermometer } from './BudgetThermometer';
import styles from './TopBar.module.css';

interface Props {
  cityName?: string;
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
  onLocationClick: () => void;
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
  cityName, query, onQuery,
  planCount, onTogglePlan,
  budget, spentByCategory, totalSpent, onBudgetTotal,
  userInitial, userTone, onAvatarClick,
  onMenu, onFilter, onLocationClick,
}: Props) {
  const grad = TONE_GRADIENT[userTone] ?? TONE_GRADIENT.gold;
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    onQuery('');
  }

  return (
    <div className={styles.topbar}>
      {/* ── Mobile hamburger ── */}
      <button
        className={`${styles.iconBtn} ${styles.mobileOnly} floatCard`}
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Brand ── */}
      <div className={`${styles.brandCard} floatCard`}>
        <span className={styles.brandMark}>
          atlas<span className={styles.brandAccent}>io</span>
        </span>
        <span className={styles.brandSub}>by Eventore</span>
      </div>

      {/* ── Location pill — desktop always, mobile always ── */}
      <button
        className={`${styles.locPill} floatCard`}
        type="button"
        title="Change location"
        onClick={onLocationClick}
      >
        <MapPin size={14} color="var(--rose)" />
        <span className={styles.locLabel}>{cityName || 'Set location'}</span>
      </button>

      {/* ── Desktop search bar ── */}
      <div className={`${styles.searchCard} floatCard ${styles.desktopOnly}`}>
        <Search size={16} color="var(--muted)" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search vendors, areas…"
          aria-label="Search vendors"
        />
      </div>

      {/* ── Mobile: expanding search overlay ── */}
      {searchOpen && (
        <div className={`${styles.mobileSearch} floatCard ${styles.mobileOnly}`}>
          <Search size={15} color="var(--muted)" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search vendors…"
            aria-label="Search vendors"
          />
          <button onClick={closeSearch} className={styles.searchClose} aria-label="Close search">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Desktop budget thermometer ── */}
      <div className={styles.desktopOnly}>
        <BudgetThermometer
          budget={budget}
          spentByCategory={spentByCategory}
          totalSpent={totalSpent}
          onEditTotal={onBudgetTotal}
        />
      </div>

      <div className={styles.spacer} />

      {/* ── Mobile: search icon ── */}
      {!searchOpen && (
        <button
          className={`${styles.iconBtn} ${styles.mobileOnly} floatCard`}
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      )}

      {/* ── Mobile: filter icon ── */}
      <button
        className={`${styles.iconBtn} ${styles.mobileOnly} floatCard`}
        onClick={onFilter}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={18} />
      </button>

      {/* ── My Plan button ── */}
      <button className={styles.planBtn} onClick={onTogglePlan} type="button">
        <CheckSquare size={14} />
        <span className={styles.planLbl}>My Plan</span>
        <span className={styles.badge}>{planCount}</span>
      </button>

      {/* ── Avatar ── */}
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
