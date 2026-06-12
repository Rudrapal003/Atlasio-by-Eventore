import { useState } from 'react';
import { MessageSquare, Search, Send, Sparkles, X } from 'lucide-react';
import styles from './MessagesDrawer.module.css';

interface Props {
  onClose: () => void;
  /** Total unread count — drives the "All" filter pill counter. */
  unreadCount: number;
  /** Total open threads. */
  totalCount: number;
  /** Vendors the user has marked as Booked or Final-confirm. */
  bookedCount: number;
}

type FilterId = 'all' | 'unread' | 'booked';

/* =========================================================
   MessagesDrawer — placeholder "proper inbox" surface.
   No backend yet, so every list is empty; the UI shows the
   structure (search + filter chips + composer) so the user
   sees what's coming. Voice follows Eventore brand guide:
   Title Case for headings + buttons, sentence case for body,
   no exclamation marks in support copy.
   ========================================================= */

export function MessagesDrawer({
  onClose, unreadCount, totalCount, bookedCount,
}: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');

  const counts: Record<FilterId, number> = {
    all: totalCount,
    unread: unreadCount,
    booked: bookedCount,
  };

  return (
    <aside className={`${styles.drawer} floatCard`}>
      {/* Header */}
      <div className={styles.head}>
        <MessageSquare size={18} />
        <h3>Messages</h3>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <Search size={14} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters} role="tablist">
        {(['all', 'unread', 'booked'] as FilterId[]).map((f) => {
          const active = filter === f;
          const label = f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Booked';
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              className={`${styles.filter} ${active ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {label}
              <span className={styles.count}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Body — empty state + preview */}
      <div className={styles.body}>
        <div className={styles.empty}>
          <div className={styles.emptyIco}>
            <MessageSquare size={32} />
          </div>
          <h4>No Conversations Yet</h4>
          <p>
            When you reach out to a vendor through atlasio, your thread will appear here —
            organized by event, searchable, and pinned to that vendor's card on the map.
          </p>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewTitle}>
            <Sparkles size={12} />
            Coming In v1.1
          </div>
          <ul className={styles.previewList}>
            <li>Structured inquiries — date, guests, budget — sent without leaving atlasio.</li>
            <li>Vendor responses pinned to their card so you don't lose context.</li>
            <li>Quote status tracking: sent · viewed · replied.</li>
            <li>Auto-archive once a booking is confirmed.</li>
          </ul>
        </div>

        <div className={styles.howNote}>
          For now, use the <b>Visit</b> or <b>Copy contact</b> buttons on a vendor's card to reach
          out by email. Save what you learn under that vendor's notes in <b>My Plan</b>.
        </div>
      </div>

      {/* Composer footer (disabled placeholder) */}
      <div className={styles.composer}>
        <button
          className={styles.composeBtn}
          onClick={() => alert('In-app messaging arrives in v1.1.\nFor now, use a vendor card to reach out by email.')}
        >
          <Send size={14} />
          Start a Conversation
        </button>
      </div>
    </aside>
  );
}
