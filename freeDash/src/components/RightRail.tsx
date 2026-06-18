import { X, MapPin } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId, Vendor, FilterState } from '@/types';
import styles from './RightRail.module.css';

interface Props {
  vendors: Vendor[];
  filters: FilterState;
  matchedCount: number;
  cityName: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCat: (id: CategoryId) => void;
  onToggleInPlanOnly: () => void;
  onLocationClick?: () => void;
}

export function RightRail({
  vendors, filters, matchedCount, cityName,
  mobileOpen, onCloseMobile,
  onToggleCat, onToggleInPlanOnly,
  onLocationClick,
}: Props) {
  const counts: Record<string, number> = {};
  CATEGORIES.forEach((c) => { counts[c.id] = 0; });
  vendors.forEach((v) => { counts[v.cat] = (counts[v.cat] ?? 0) + 1; });

  const areaLabel = cityName || 'All Areas';

  const content = (
    <>
      {/* Location row — mobile only */}
      {onLocationClick && (
        <button
          onClick={() => { onLocationClick(); onCloseMobile(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)', padding: '10px 12px', marginBottom: 12,
            font: '600 13px "Inter Tight", sans-serif', color: 'var(--brand)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <MapPin size={15} color="var(--rose)" />
          {areaLabel === 'All Areas' ? 'Set your location' : `Near ${areaLabel}`}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>Change</span>
        </button>
      )}

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
                  <div className={styles.sub}>in {areaLabel}</div>
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
    </>
  );

  return (
    <>
      {/* Backdrop — mobile only */}
      {mobileOpen && <div className={styles.backdrop} onClick={onCloseMobile} />}

      <aside className={`${styles.panel} floatCard ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Mobile header bar */}
        <div className={styles.mobileClose}>
          <span className={styles.mobileCloseTitle}>Filter vendors</span>
          <button className={styles.mobileCloseBtn} onClick={onCloseMobile} aria-label="Close filters">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.scrollArea}>
          {content}
        </div>

        {/* Done button — mobile only */}
        <div className={styles.doneBtn}>
          <button className={styles.doneBtnInner} onClick={onCloseMobile}>
            Show {matchedCount} vendors
          </button>
        </div>
      </aside>
    </>
  );
}
