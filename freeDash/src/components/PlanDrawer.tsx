import { useState } from 'react';
import {
  CheckSquare, X, ChevronRight, Plus, Trash2,
} from 'lucide-react';
import type {
  Plan, Vendor, ChecklistKey, ExpenseEntry, ExpenseLabel,
} from '@/types';
import { catById } from '@/data/categories';
import { CHECKLIST, stageLabel } from '@/data/stages';
import { EXPENSE_LABELS, type AddExpenseInput } from '@/hooks/useExpenses';
import { fmtCAD } from '@/lib/format';
import styles from './PlanDrawer.module.css';

interface Props {
  plan: Plan;
  vendors: Vendor[];
  onClose: () => void;
  onRemove: (vendorId: string) => void;
  onToggleCheck: (vendorId: string, key: ChecklistKey) => void;
  onNotes: (vendorId: string, notes: string) => void;
  countsByStage: Record<string, number>;
  /** Expense rows per vendor (already filtered by hook). */
  expensesByVendor: (vendorId: string) => ExpenseEntry[];
  totalForVendor: (vendorId: string) => number;
  onAddExpense: (input: AddExpenseInput) => void;
  onRemoveExpense: (id: string) => void;
}

interface DraftExpense {
  amount: string;
  label: ExpenseLabel;
  spentOn: string;
  note: string;
}

function newDraft(): DraftExpense {
  return {
    amount: '',
    label: 'deposit',
    spentOn: new Date().toISOString().slice(0, 10),
    note: '',
  };
}

export function PlanDrawer({
  plan, vendors, onClose,
  onRemove, onToggleCheck, onNotes,
  countsByStage,
  expensesByVendor, totalForVendor,
  onAddExpense, onRemoveExpense,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [composingFor, setComposingFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftExpense>(newDraft());
  const ids = Object.keys(plan);

  const startCompose = (vendorId: string) => {
    setComposingFor(vendorId);
    setDraft(newDraft());
  };
  const cancelCompose = () => {
    setComposingFor(null);
    setDraft(newDraft());
  };
  const submitCompose = (vendorId: string) => {
    const amount = parseInt(draft.amount.replace(/[^\d]/g, ''), 10);
    if (Number.isNaN(amount) || amount <= 0) return;
    onAddExpense({
      vendorId,
      amount,
      label: draft.label,
      spentOn: draft.spentOn,
      note: draft.note,
    });
    cancelCompose();
  };

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
            const vendorSpent = totalForVendor(id);
            const vendorExpenses = expensesByVendor(id);
            const isComposing = composingFor === id;
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
                    placeholder="Notes — dates discussed, follow-ups…"
                    value={p.notes}
                    onChange={(e) => onNotes(id, e.target.value)}
                  />

                  {/* ---------- Expenses block ---------- */}
                  <div className={styles.expHead}>
                    <span className={styles.expLbl}>
                      Expenses {vendorSpent > 0 && <b>{fmtCAD(vendorSpent)}</b>}
                    </span>
                    {!isComposing && (
                      <button
                        className={styles.expAdd}
                        onClick={(e) => { e.stopPropagation(); startCompose(id); }}
                      >
                        <Plus size={12} /> Add Expense
                      </button>
                    )}
                  </div>

                  {vendorExpenses.length > 0 && (
                    <ul className={styles.expList}>
                      {vendorExpenses.map((ex) => (
                        <li key={ex.id} className={styles.expRow}>
                          <span className={styles.expAmt}>{fmtCAD(ex.amount)}</span>
                          <span className={styles.expLabelTag}>
                            {EXPENSE_LABELS.find((l) => l.id === ex.label)?.label ?? 'Other'}
                          </span>
                          <span className={styles.expDate}>
                            {new Date(ex.spentOn).toLocaleDateString('en-CA', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                          <button
                            className={styles.expRemove}
                            onClick={(e) => { e.stopPropagation(); onRemoveExpense(ex.id); }}
                            aria-label="Remove expense"
                          >
                            <Trash2 size={11} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {isComposing && (
                    <div className={styles.expForm}>
                      <div className={styles.expFormRow}>
                        <div className={styles.expCurrency}>
                          <span>$</span>
                          <input
                            inputMode="numeric"
                            value={draft.amount}
                            onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/[^\d]/g, '') })}
                            placeholder="0"
                            autoFocus
                          />
                        </div>
                        <select
                          className={styles.expSelect}
                          value={draft.label}
                          onChange={(e) => setDraft({ ...draft, label: e.target.value as ExpenseLabel })}
                        >
                          {EXPENSE_LABELS.map((l) => (
                            <option key={l.id} value={l.id}>{l.label}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="date"
                        className={styles.expDateInput}
                        value={draft.spentOn}
                        onChange={(e) => setDraft({ ...draft, spentOn: e.target.value })}
                      />
                      <div className={styles.expActions}>
                        <button
                          className={styles.expSubmit}
                          onClick={(e) => { e.stopPropagation(); submitCompose(id); }}
                          disabled={!draft.amount || parseInt(draft.amount, 10) <= 0}
                        >
                          Add
                        </button>
                        <button
                          className={styles.expCancel}
                          onClick={(e) => { e.stopPropagation(); cancelCompose(); }}
                        >
                          Cancel
                        </button>
                      </div>
                      <p className={styles.expHint}>
                        Logged anonymously. The amount feeds the average-spend stats other planners
                        will see for this vendor.
                      </p>
                    </div>
                  )}

                  <button className={styles.removeBtn} onClick={() => onRemove(id)}>
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
