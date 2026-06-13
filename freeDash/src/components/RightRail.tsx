import { X } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId, Vendor, FilterState } from '@/types';
import styles from './RightRail.module.css';

interface Props {
  vendors: Vendor[];
  filters: FilterState;
  matchedCount: number;
  /** Mobile-only — when true the rail slides in over the map with a backdrop. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCat: (id: CategoryId) => void;
  onToggleInPlanOnly: () => void;
}

/* =========================================================
   Right rail — vendor type categories list + a "show only my
   plan" toggle. Each category shows its count of available
   vendors in the city; sponsored placement will surface here
   too (badge + sort order).
   ========================================================= */

export function RightRail({
  vendors, filters, matchedCount,
  mobileOpen, onCloseMobile,
  onToggleCat, onToggleInPlanOnly,
}: Props) {
  const counts: Record<string, number> = {};
  CATEGORIES.forEach((c) => { counts[c.id] = 0; });
  vendors.forEach((v) => { counts[v.cat] = (counts[v.cat] ?? 0) + 1; });

  return (
    <>
      {mobileOpen && <div className={styles.backdrop} onClick={onCloseMobile} />}
      <aside className={`${styles.panel} floatCard ${mobileOpen ? styles.mobileOpen : ''}`}>
        <button className={styles.mobileClose} onClick={onCloseMobile} aria-label="Close filters">
          <X size={16} />
        </button>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Vendor types <span className={styles.count}>{matchedCount}</span>
        </div>
        <div className={styles.list}>
          {CATEGORIES.map((c) => {
            const active = filters.selectedCats.includes(c.id);
            return (
              <button
                key={c.id}
                className={`${styles.catBtn} ${active ? styles.active : ''}`}
                onClick={() => onToggleCat(c.id)}
              >
                <div className={styles.swatch} style={{ background: c.hex }}>
                  <span className={styles.swatchEmoji}>{c.emoji}</span>
                </div>
                <div className={styles.meta}>
                  <div className={styles.nm}>{c.label}</div>
                  <div className={styles.sub}>in Greater Vancouver</div>
                </div>
                <span className={styles.nmCount}>{counts[c.id]}</span>
              </button>
            );
          })}
        </div>

        <div
          className={`${styles.quickToggle} ${filters.showOnlyInPlan ? styles.on : ''}`}
          onClick={onToggleInPlanOnly}
        >
          <span className={styles.lb}>Show only my plan</span>
          <span className={styles.sw} />
        </div>
      </div>
      </aside>
    </>
  );
}
