import { useMemo } from 'react';
import {
  Calendar, Users, MessageSquare, FileText, DollarSign, Sparkles, Settings,
} from 'lucide-react';
import type { EventEntry, FilterState, UserProfile } from '@/types';
import { daysUntil } from '@/lib/format';
import styles from './LeftRail.module.css';

interface Props {
  profile: UserProfile;
  activeEvent: EventEntry;
  eventCount: number;
  vendorsInPlan: number;
  vendorsBooked: number;
  /** Real unread-message count. 0 hides the badge entirely. */
  unreadMessages: number;
  filters: FilterState;
  onDistKm: (n: number) => void;
  onMinRating: (n: number) => void;
  onTogglePriceTier: (t: number) => void;
  onResetFilters: () => void;
  onFunction: (fn: string) => void;
}

/* =========================================================
   Left rail — profile, active event card, function tools grid,
   and refine-search controls. The "function tools" buttons
   open the relevant tab in the SettingsDrawer.
   ========================================================= */

/* Function-tool definitions. `badgeKey` names a prop on Props whose
   value (if > 0) is rendered as a small red nub on the tile. */
const FUNCTIONS = [
  { id: 'timeline',  label: 'Timeline',     sub: 'Day-of run sheet',  color: 'brand',  Icon: Calendar      },
  { id: 'guests',    label: 'Guest list',   sub: 'Invitees + RSVPs',  color: 'rose',   Icon: Users         },
  { id: 'messages',  label: 'Messages',     sub: 'Vendor inquiries',  color: 'violet', Icon: MessageSquare, badgeKey: 'unreadMessages' as const },
  { id: 'docs',      label: 'Documents',    sub: 'Contracts, IDs',    color: 'gold',   Icon: FileText      },
  { id: 'budget',    label: 'Budget',       sub: 'By category',       color: 'green',  Icon: DollarSign    },
  { id: 'ai',        label: 'AI assistant', sub: 'Plan with me',      color: 'cyan',   Icon: Sparkles      },
] as const;

export function LeftRail({
  profile, activeEvent, eventCount,
  vendorsInPlan, vendorsBooked,
  unreadMessages,
  filters,
  onDistKm, onMinRating, onTogglePriceTier, onResetFilters,
  onFunction,
}: Props) {
  const daysToEvent = useMemo(() => daysUntil(activeEvent.date), [activeEvent.date]);
  const badgeFor = (key?: string): number => {
    if (key === 'unreadMessages') return unreadMessages;
    return 0;
  };

  return (
    <aside className={`${styles.panel} floatCard`}>
      {/* Profile */}
      <section className={styles.section}>
        <div className={styles.profileBlock}>
          <div className={styles.pic}>{profile.initial}</div>
          <div className={styles.who}>
            <div className={styles.nm}>{profile.name}</div>
            <div className={styles.sub}>
              Planning {eventCount} event{eventCount === 1 ? '' : 's'} · Free tier
            </div>
          </div>
          <button
            className={styles.gear}
            title="Profile settings"
            onClick={() => onFunction('profile-settings')}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Active event card */}
        <div className={styles.eventCard}>
          <div className={styles.eventTtl}>{activeEvent.title}</div>
          <div className={styles.eventMeta}>
            <span>📅 {new Date(activeEvent.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>👥 {activeEvent.guestCount} guests</span>
            <span>📍 {activeEvent.locationLabel}</span>
          </div>
          <div className={styles.eventStats}>
            <div className={styles.eventStat}>
              <div className={styles.statN}>{daysToEvent}</div>
              <div className={styles.statL}>days to go</div>
            </div>
            <div className={styles.eventStat}>
              <div className={styles.statN}>{vendorsInPlan}</div>
              <div className={styles.statL}>vendors</div>
            </div>
            <div className={styles.eventStat}>
              <div className={styles.statN}>{vendorsBooked}</div>
              <div className={styles.statL}>booked</div>
            </div>
          </div>
          <div className={styles.eventSwitcher}>
            <span>Active event</span>
            <a className={styles.switchLink} onClick={() => onFunction('switch-event')}>Switch ›</a>
          </div>
        </div>
      </section>

      {/* Function grid */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Event tools</div>
        <div className={styles.funcGrid}>
          {FUNCTIONS.map(({ id, label, sub, color, Icon, ...rest }) => {
            const badge = 'badgeKey' in rest ? badgeFor(rest.badgeKey) : 0;
            return (
              <button
                key={id}
                className={styles.funcBtn}
                data-c={color}
                onClick={() => onFunction(id)}
              >
                <div className={styles.funcIco}><Icon size={16} /></div>
                <div className={styles.funcLb}>{label}</div>
                <div className={styles.funcSb}>{sub}</div>
                {badge > 0 ? <span className={styles.funcNub}>{badge}</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Refine */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Refine search</div>
        <div className={styles.refineBlock}>
          <div className={styles.refineRow}>
            <div className={styles.refineLbl}>
              Distance from city centre <b>{filters.distKm} km</b>
            </div>
            <input
              type="range" min={1} max={50} value={filters.distKm}
              onChange={(e) => onDistKm(+e.target.value)}
            />
          </div>
          <div className={styles.refineRow}>
            <div className={styles.refineLbl}>Price tier</div>
            <div className={styles.priceTiers}>
              {[1, 2, 3, 4].map((t) => (
                <div
                  key={t}
                  className={`${styles.priceTier} ${filters.priceTiers.includes(t) ? styles.active : ''}`}
                  onClick={() => onTogglePriceTier(t)}
                >
                  {'$'.repeat(t)}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.refineRow}>
            <div className={styles.refineLbl}>
              Minimum rating <b>{filters.minRating ? `${filters.minRating} ★` : 'any'}</b>
            </div>
            <input
              type="range" min={0} max={5} step={0.5} value={filters.minRating}
              onChange={(e) => onMinRating(+e.target.value)}
            />
          </div>
          <button className={styles.resetBtn} onClick={onResetFilters}>Reset filters</button>
        </div>
      </section>
    </aside>
  );
}
