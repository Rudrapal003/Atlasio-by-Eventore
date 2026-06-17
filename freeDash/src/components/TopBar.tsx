import { Search, MapPin } from 'lucide-react';
import styles from './TopBar.module.css';

interface Props {
  cityName: string;
  query: string;
  onFilter: () => void;
  onMenu: () => void;
  onLocationClick: () => void;
  onChange: (q: string) => void;
}

/* =========================================================
TopBar — search field + location pill + avatar.
Location pill is now clickable — opens the city / geo picker.
========================================================= */

export function TopBar({ cityName, query, onFilter, onMenu, onLocationClick, onChange }: Props) {
  return (
    <header className={styles.bar}>
      {/* Hamburger — mobile only */}
      <button
        className={`${styles.hamburger} ${styles.mobileOnly}`}
        type="button"
        aria-label="Open menu"
        onClick={onMenu}
      >
        <span /><span /><span />
      </button>

      {/* Search */}
      <div className={`${styles.search} floatCard`}>
        <Search size={14} color="var(--text-muted)" />
        <input
          className={styles.input}
          placeholder="Search vendors, categories…"
          value={query}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className={`${styles.filterBtn} ${styles.mobileOnly}`}
          type="button"
          onClick={onFilter}
          aria-label="Open filters"
        >
          ⚙
        </button>
      </div>

      {/* Location pill — clickable */}
      <button
        className={`${styles.locPill} floatCard ${styles.desktopOnly}`}
        type="button"
        title="Change city or location"
        onClick={onLocationClick}
      >
        <MapPin size={14} color="var(--rose)" />
        {cityName || 'Set location'}
      </button>
    </header>
  );
}
