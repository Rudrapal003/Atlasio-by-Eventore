import { useEffect, useState } from 'react';
import {
  X, User, Calendar, DollarSign, Bell, Info, Trash2, Check, Plus,
} from 'lucide-react';
import type {
  UserProfile, EventEntry, BudgetCategoryAllocation,
  BudgetState, AvatarTone, CategoryId,
} from '@/types';
import { CATEGORIES } from '@/data/categories';
import { fmtCAD, daysUntil } from '@/lib/format';
import styles from './SettingsDrawer.module.css';

export type SettingsTabId = 'profile' | 'events' | 'budget' | 'preferences' | 'about';

interface Props {
  profile: UserProfile;
  events: EventEntry[];
  activeEventId: string;
  budget: BudgetState;
  alloc: BudgetCategoryAllocation;
  /** Sum of all planner-logged expenses (auto, read-only). */
  totalSpent: number;
  initialTab?: SettingsTabId;
  onClose: () => void;
  onSetName: (name: string) => void;
  onSetEmail: (email: string) => void;
  onSetTone: (tone: AvatarTone) => void;
  onCreateEvent: () => void;
  onUpdateEvent: (id: string, patch: Partial<EventEntry>) => void;
  onDeleteEvent: (id: string) => void;
  onSetActiveEvent: (id: string) => void;
  onSetBudgetTotal: (n: number) => void;
  onSetCategoryBudget: (cat: CategoryId, amount: number) => void;
  onResetData: () => void;
}

const TABS: { id: SettingsTabId; label: string; Icon: typeof User }[] = [
  { id: 'profile',     label: 'Profile',     Icon: User      },
  { id: 'events',      label: 'My Events',   Icon: Calendar  },
  { id: 'budget',      label: 'Budget',      Icon: DollarSign },
  { id: 'preferences', label: 'Preferences', Icon: Bell      },
  { id: 'about',       label: 'About',       Icon: Info      },
];

const AVATAR_TONES: { id: AvatarTone; label: string; from: string; to: string }[] = [
  { id: 'gold',   label: 'Gold',   from: '#E8B931', to: '#C9A227' },
  { id: 'brand',  label: 'Navy',   from: '#2E6FB0', to: '#1F4E79' },
  { id: 'rose',   label: 'Rose',   from: '#FB7185', to: '#E11D48' },
  { id: 'green',  label: 'Green',  from: '#34D399', to: '#059669' },
  { id: 'violet', label: 'Violet', from: '#A78BFA', to: '#8B5CF6' },
  { id: 'amber',  label: 'Amber',  from: '#FBBF24', to: '#D97706' },
];

/* =========================================================
   SettingsDrawer — left slide-in panel with 5 tabs.
   Copy follows Eventore brand guidelines: Title Case for
   headings + buttons, sentence case for body, "All set."
   for confirmations, no exclamation marks in support text.
   ========================================================= */

export function SettingsDrawer(props: Props) {
  const [tab, setTab] = useState<SettingsTabId>(props.initialTab ?? 'profile');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  return (
    <aside className={`${styles.drawer} floatCard`}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headTitle}>Settings</div>
        <button className={styles.closeBtn} onClick={props.onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {tab === 'profile' && (
          <ProfileTab profile={props.profile}
            onName={(n)  => { props.onSetName(n);  showToast('Got it.'); }}
            onEmail={(e) => { props.onSetEmail(e); showToast('All set.'); }}
            onTone={(t)  => { props.onSetTone(t);  showToast('Done.'); }}
          />
        )}

        {tab === 'events' && (
          <EventsTab
            events={props.events}
            activeId={props.activeEventId}
            onActivate={(id) => { props.onSetActiveEvent(id); showToast('All set.'); }}
            onCreate={() => { props.onCreateEvent(); showToast('Event created.'); }}
            onUpdate={(id, patch) => { props.onUpdateEvent(id, patch); }}
            onDelete={(id) => { props.onDeleteEvent(id); showToast('Done.'); }}
          />
        )}

        {tab === 'budget' && (
          <BudgetTab
            budget={props.budget}
            alloc={props.alloc}
            totalSpent={props.totalSpent}
            onSetTotal={(n) => { props.onSetBudgetTotal(n); showToast('All set.'); }}
            onSetCat={(c, n) => { props.onSetCategoryBudget(c, n); }}
          />
        )}

        {tab === 'preferences' && (
          <PreferencesTab onReset={() => {
            if (confirm('Clear all atlasio data on this device? This cannot be undone.')) {
              props.onResetData();
              showToast('Done.');
            }
          }} />
        )}

        {tab === 'about' && <AboutTab />}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </aside>
  );
}

/* ---------- Profile tab ---------- */

function ProfileTab({
  profile,
  onName, onEmail, onTone,
}: {
  profile: UserProfile;
  onName: (n: string) => void;
  onEmail: (e: string) => void;
  onTone: (t: AvatarTone) => void;
}) {
  const tone = AVATAR_TONES.find((t) => t.id === profile.tone) ?? AVATAR_TONES[0]!;

  /* Fully controlled inputs — keystroke commits to the hook so tab
     switches and drawer closes never lose work. localStorage writes
     are cheap; the hook batches via useEffect. */
  return (
    <section className={styles.section}>
      <div
        className={styles.bigAvatar}
        style={{ background: `linear-gradient(135deg, ${tone.from}, ${tone.to})` }}
      >
        {profile.initial}
      </div>

      <Field label="Display name" hint="Shown on your avatar and on shared plans.">
        <input
          className={styles.input}
          value={profile.name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Your name"
          maxLength={40}
        />
      </Field>

      <Field label="Email" hint="Used for plan recovery later — never shared.">
        <input
          className={styles.input}
          type="email"
          value={profile.email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={120}
        />
      </Field>

      <Field label="Avatar color">
        <div className={styles.toneRow}>
          {AVATAR_TONES.map((t) => (
            <button
              key={t.id}
              className={`${styles.toneSwatch} ${profile.tone === t.id ? styles.toneActive : ''}`}
              style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              onClick={() => onTone(t.id)}
              title={t.label}
              aria-label={`${t.label} avatar`}
            >
              {profile.tone === t.id ? <Check size={14} color="#fff" /> : null}
            </button>
          ))}
        </div>
      </Field>

      <p className={styles.fineprint}>
        Your profile is stored on this device. Sign-in sync arrives in v1.1.
      </p>
    </section>
  );
}

/* ---------- Events tab ---------- */

function EventsTab({
  events, activeId,
  onActivate, onCreate, onUpdate, onDelete,
}: {
  events: EventEntry[];
  activeId: string;
  onActivate: (id: string) => void;
  onCreate: () => void;
  onUpdate: (id: string, patch: Partial<EventEntry>) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <button className={styles.btnPrimary} onClick={onCreate}>
        <Plus size={14} /> New Event
      </button>

      <div className={styles.eventList}>
        {events.map((e) => {
          const isActive = e.id === activeId;
          const isEditing = editingId === e.id;
          const days = daysUntil(e.date);
          return (
            <div key={e.id} className={`${styles.eventRow} ${isActive ? styles.eventActive : ''}`}>
              <div className={styles.eventTop}>
                <button
                  className={`${styles.activeDot} ${isActive ? styles.activeDotOn : ''}`}
                  onClick={() => onActivate(e.id)}
                  aria-label={isActive ? 'Active event' : 'Make active'}
                >
                  {isActive && <Check size={12} />}
                </button>
                <div className={styles.eventTitles}>
                  <div className={styles.eventName}>{e.title}</div>
                  <div className={styles.eventMeta}>
                    {new Date(e.date).toLocaleDateString('en-CA', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {' · '}
                    {e.guestCount} guests
                    {' · '}
                    {days} days
                  </div>
                </div>
                <button
                  className={styles.linkBtn}
                  onClick={() => setEditingId(isEditing ? null : e.id)}
                >
                  {isEditing ? 'Close' : 'Edit'}
                </button>
              </div>

              {isEditing && (
                <div className={styles.eventEdit}>
                  <Field label="Title">
                    <input
                      className={styles.input}
                      value={e.title}
                      onChange={(ev) => onUpdate(e.id, { title: ev.target.value })}
                      maxLength={60}
                    />
                  </Field>
                  <div className={styles.row2}>
                    <Field label="Date">
                      <input
                        className={styles.input}
                        type="date"
                        value={e.date}
                        onChange={(ev) => onUpdate(e.id, { date: ev.target.value })}
                      />
                    </Field>
                    <Field label="Guests">
                      <input
                        className={styles.input}
                        type="number"
                        min={1}
                        max={5000}
                        value={e.guestCount}
                        onChange={(ev) => onUpdate(e.id, { guestCount: parseInt(ev.target.value, 10) || 0 })}
                      />
                    </Field>
                  </div>
                  <Field label="Location label" hint="Area or venue name — for the event card.">
                    <input
                      className={styles.input}
                      value={e.locationLabel}
                      onChange={(ev) => onUpdate(e.id, { locationLabel: ev.target.value })}
                      maxLength={40}
                    />
                  </Field>
                  <Field label="Notes">
                    <textarea
                      className={styles.input}
                      rows={3}
                      value={e.notes}
                      onChange={(ev) => onUpdate(e.id, { notes: ev.target.value })}
                    />
                  </Field>
                  {events.length > 1 && (
                    <button
                      className={styles.dangerBtn}
                      onClick={() => {
                        if (confirm(`Delete "${e.title}"? This cannot be undone.`)) {
                          onDelete(e.id);
                          setEditingId(null);
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete Event
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Budget tab ---------- */

function BudgetTab({
  budget, alloc, totalSpent,
  onSetTotal, onSetCat,
}: {
  budget: BudgetState;
  alloc: BudgetCategoryAllocation;
  totalSpent: number;
  onSetTotal: (n: number) => void;
  onSetCat: (cat: CategoryId, n: number) => void;
}) {
  const allocatedSum = (Object.values(alloc) as number[]).reduce((a, b) => a + (b || 0), 0);
  const unallocated = Math.max(0, budget.total - allocatedSum);

  return (
    <section className={styles.section}>
      <Field label="Total event budget" hint="The grand-total ceiling shown in the top-bar thermometer.">
        <CurrencyInput value={budget.total} onChange={onSetTotal} />
      </Field>

      <Field
        label="Spent so far"
        hint="Auto-calculated from expenses you've logged on vendors in My Plan."
      >
        <div className={styles.readOnlyAmount}>
          {fmtCAD(totalSpent)}
        </div>
      </Field>

      <div className={styles.allocHeader}>
        <div className={styles.allocLbl}>Planned by category</div>
        <div className={styles.allocRight}>
          <span className={styles.allocSub}>Allocated</span>
          <span className={styles.allocNum}>{fmtCAD(allocatedSum)}</span>
          <span className={styles.allocPipe}>·</span>
          <span className={styles.allocSub}>Unassigned</span>
          <span className={styles.allocNum}>{fmtCAD(unallocated)}</span>
        </div>
      </div>

      <div className={styles.catList}>
        {CATEGORIES.map((c) => (
          <div key={c.id} className={styles.catRow}>
            <span className={styles.catSwatch} style={{ background: c.hex }}>{c.emoji}</span>
            <span className={styles.catName}>{c.label}</span>
            <CurrencyInput
              compact
              value={alloc[c.id] ?? 0}
              onChange={(n) => onSetCat(c.id, n)}
            />
          </div>
        ))}
      </div>

      <p className={styles.fineprint}>
        Per-category amounts are your planned ceilings. Actual spend is what you log in My Plan;
        the top-bar thermometer shows the real total in colored segments.
      </p>
    </section>
  );
}

/* ---------- Preferences tab ---------- */

function PreferencesTab({ onReset }: { onReset: () => void }) {
  const [emailDigest, setEmailDigest] = useState<'off' | 'weekly' | 'monthly'>('off');
  const [sounds, setSounds] = useState(false);

  return (
    <section className={styles.section}>
      <Field label="Weekly email digest" hint="A short summary of new vendors in your filters.">
        <div className={styles.segGroup}>
          {(['off', 'weekly', 'monthly'] as const).map((v) => (
            <button
              key={v}
              className={`${styles.seg} ${emailDigest === v ? styles.segActive : ''}`}
              onClick={() => setEmailDigest(v)}
            >
              {v === 'off' ? 'Off' : v === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Notification sounds">
        <Toggle on={sounds} onChange={setSounds} />
      </Field>

      <Field label="Theme" hint="Dark mode arrives in v1.1.">
        <div className={styles.segGroup}>
          <button className={`${styles.seg} ${styles.segActive}`}>Light</button>
          <button className={styles.seg} disabled>Dark</button>
          <button className={styles.seg} disabled>Auto</button>
        </div>
      </Field>

      <div className={styles.divider} />

      <Field label="Reset all atlasio data" hint="Wipes plan, profile, events, and budget from this device.">
        <button className={styles.dangerBtn} onClick={onReset}>
          <Trash2 size={13} /> Reset Everything
        </button>
      </Field>
    </section>
  );
}

/* ---------- About tab ---------- */

function AboutTab() {
  return (
    <section className={styles.section}>
      <div className={styles.aboutCard}>
        <div className={styles.aboutMark}>
          atlas<span className={styles.aboutMarkAccent}>io</span>
        </div>
        <div className={styles.aboutTag}>One stop. Every event.</div>
        <div className={styles.aboutPub}>By Eventore · Made in Vancouver</div>
      </div>

      <div className={styles.aboutGrid}>
        <a className={styles.aboutLink} href="https://eventore.ca" target="_blank" rel="noopener noreferrer">
          Eventore main site
        </a>
        <a className={styles.aboutLink} href="#" onClick={(e) => e.preventDefault()}>
          Privacy policy
        </a>
        <a className={styles.aboutLink} href="#" onClick={(e) => e.preventDefault()}>
          Terms of service
        </a>
        <a className={styles.aboutLink} href="mailto:hello@eventore.ca">
          Contact us
        </a>
      </div>

      <p className={styles.fineprint}>
        Map tiles by OpenStreetMap contributors. Vendor data is curated;
        listings are not endorsements. Reviews are independent. Sponsored
        placements are marked with a gold "Featured" badge.
      </p>
      <p className={styles.fineprint}>v0.7.0 · 2026-06-11</p>
    </section>
  );
}

/* ---------- Tiny shared bits ---------- */

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLbl}>{label}</label>
      {children}
      {hint ? <div className={styles.fieldHint}>{hint}</div> : null}
    </div>
  );
}

function CurrencyInput({
  value, onChange, compact,
}: { value: number; onChange: (n: number) => void; compact?: boolean }) {
  /* Local draft string lets the user clear the field and type freely;
     every keystroke also commits to the parent so tab switches don't
     drop unsaved work. The effect re-syncs when the prop changes
     externally (e.g. a Reset). */
  const [draft, setDraft] = useState(value.toString());
  useEffect(() => { setDraft(value.toString()); }, [value]);
  return (
    <div className={`${styles.currency} ${compact ? styles.currencyCompact : ''}`}>
      <span className={styles.currencySym}>$</span>
      <input
        className={styles.currencyInput}
        inputMode="numeric"
        value={draft}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d]/g, '');
          setDraft(cleaned);
          onChange(parseInt(cleaned || '0', 10));
        }}
      />
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className={styles.toggleDot} />
    </button>
  );
}
