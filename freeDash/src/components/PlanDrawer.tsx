import { useState } from 'react';
import { CheckSquare, X, ChevronRight } from 'lucide-react';
import type { Plan, Vendor, ChecklistKey } from '@/types';
import { catById } from '@/data/categories';
import { CHECKLIST, stageLabel } from '@/data/stages';
import styles from './PlanDrawer.module.css';

interface Props {
  plan: Plan;
  vendors: Vendor[];
  onClose: () => void;
  onRemove: (vendorId: string) => void;
  onToggleCheck: (vendorId: string, key: ChecklistKey) => void;
  onNotes: (vendorId: string, notes: string) => void;
  countsByStage: Record<string, number>;
}

export function PlanDrawer({
  plan, vendors, onClose,
  onRemove, onToggleCheck, onNotes,
  countsByStage,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const ids = Object.keys(plan);

  return (
    <aside className={`${styles.drawer} floatCard`}>
      <div className={styles.head}>
        <CheckSquare size={18} />
        <h3>My plan</h3>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {ids.length === 0 ? (
        <div className={styles.body}>
          <div className={styles.empty}>
            <div className={styles.emptyIco}><CheckSquare size={26} /></div>
            <h3>Your plan is empty</h3>
            <p>Click a vendor on the map and<br/>"Add to my plan" to start tracking.</p>
          </div>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <div className={styles.statN}>{ids.length}</div>
              <div className={styles.statL}>vendors</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{countsByStage.booked + countsByStage.confirmed}</div>
              <div className={styles.statL}>booked</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{countsByStage.researched + countsByStage.contacted}</div>
              <div className={styles.statL}>to do</div>
            </div>
          </div>

          {ids.map((id) => {
            const v = vendors.find((x) => x.id === id);
            if (!v) return null;
            const p = plan[id];
            const c = catById(v.cat);
            const isOpen = !!open[id];
            return (
              <div key={id} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
                <div
                  className={styles.itemHead}
                  onClick={() => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))}
                >
                  <div className={styles.strip} style={{ background: c.hex }} />
                  <div className={styles.titles}>
                    <div className={styles.titleN}>{v.name}</div>
                    <div className={styles.titleS}>{c.label} · {v.area}</div>
                  </div>
                  <div className={styles.stagePill}>{stageLabel(p.stage)}</div>
                  <ChevronRight size={16} className={styles.chev} />
                </div>
                <div className={styles.checklist}>
                  {CHECKLIST.map(({ key, label }) => (
                    <div
                      key={key}
                      className={`${styles.checkRow} ${p.checks[key] ? styles.done : ''}`}
                      onClick={() => onToggleCheck(id, key)}
                    >
                      <span className={styles.cbox} />
                      <span className={styles.label}>{label}</span>
                    </div>
                  ))}
                  <textarea
                    className={styles.notes}
                    placeholder="Quotes, dates, follow-ups…"
                    value={p.notes}
                    onChange={(e) => onNotes(id, e.target.value)}
                  />
                  <button className={styles.remove} onClick={() => onRemove(id)}>
                    Remove from plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
