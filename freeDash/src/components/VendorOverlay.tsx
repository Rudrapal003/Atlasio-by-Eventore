import { useState } from 'react';
import { X, ExternalLink, Lock } from 'lucide-react';
import type { Vendor } from '@/types';
import { catById } from '@/data/categories';
import { fmtCAD, stars } from '@/lib/format';
import { resolveOutboundUrl, trackOutboundClick } from '@/lib/tracking';
import styles from './VendorOverlay.module.css';

interface Props {
  vendor: Vendor;
  inPlan: boolean;
  /** Total CAD the planner has actually logged for this vendor. */
  spent: number;
  /** How many separate expense rows have been logged for this vendor. */
  expenseCount: number;
  onClose: () => void;
  onTogglePlan: () => void;
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

/* =========================================================
   Floating vendor card. Bottom-left of the map. Animates in.
   "Visit website" fires the outbound tracking beacon and then
   navigates — both invisible to the user.
   ========================================================= */

export function VendorOverlay({ vendor, inPlan, spent, expenseCount, onClose, onTogglePlan, isGuest, onRequireAuth }: Props) {
  const c = catById(vendor.cat);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const handleVisit = () => {
    const url = resolveOutboundUrl(vendor);
    void trackOutboundClick({
      vendorId: vendor.id,
      targetUrl: url,
      surface: 'vendor-card',
      sponsored: vendor.sponsored,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    const lines = [
      vendor.name,
      vendor.email && `Email: ${vendor.email}`,
      vendor.phone && `Phone: ${vendor.phone}`,
      vendor.web && `Web: ${vendor.web}`,
    ].filter(Boolean);

    const txt = lines.join('\n');
    void navigator.clipboard?.writeText(txt);
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 1400);
  };

  return (
    <div className={`${styles.overlay} floatCard`}>
      <button className={styles.closeX} onClick={onClose} aria-label="Close">
        <X size={14} />
      </button>

      <div className={styles.hero} style={{ ['--hero-c' as never]: c.hex } as never}>
        <div className={styles.pattern} />
        {vendor.sponsored ? <div className={styles.sponsoredBadge}>★ Featured</div> : null}
        <div className={styles.catTag}>
          <span className={styles.dot} style={{ background: c.hex }} />
          {c.label}
        </div>
        {/* Price tier deliberately omitted — we only show what we actually
            know about a vendor. Real spend appears once the planner logs
            it in My Plan. */}
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{vendor.name}</div>
        
        <div className={styles.contactCell} style={{ marginBottom: '16px' }}>
          <div className={styles.lbl}>Email</div>
          <div className={styles.val}>{vendor.email || 'Not listed'}</div>
        </div>

        <div className={styles.restrictedWrapper} onClick={isGuest ? onRequireAuth : undefined}>
          {isGuest && (
            <div className={styles.restrictedOverlay}>
              <div className={styles.lockBadge}>
                <Lock size={16} />
                <span>Sign up to view full details</span>
              </div>
            </div>
          )}
          
          <div className={isGuest ? styles.blurredContent : ''}>
            <div className={styles.meta}>
              <span className={styles.star}>{stars(vendor.rating)}</span>
              <span>·</span>
              <span>{vendor.area}</span>
            </div>
            <p className={styles.brief}>{vendor.brief}</p>

            <div className={styles.contactGrid}>
              <div className={styles.contactCell}>
                <div className={styles.lbl}>Phone</div>
                <div className={styles.val}>{vendor.phone || 'Not listed'}</div>
              </div>
              <div className={`${styles.contactCell} ${styles.full}`}>
                <div className={styles.lbl}>Website</div>
                <div className={styles.val}>{vendor.web || 'Not listed'}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.btnPrimary} ${inPlan ? styles.inPlan : ''}`}
                onClick={isGuest ? undefined : onTogglePlan}
                disabled={isGuest}
              >
                {inPlan ? '✓ In your plan' : 'Add to my plan'}
              </button>
              <button className={styles.btnSecondary} onClick={isGuest ? undefined : handleVisit} disabled={isGuest}>
                <ExternalLink size={14} />
                Visit
              </button>
              <button className={styles.btnSecondary} onClick={isGuest ? undefined : handleCopy} disabled={isGuest}>
                {copyState === 'copied' ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <div className={styles.sectionTitle}>Your Spend Here</div>
            <div className={styles.quotes}>
              {spent > 0 ? (
                <div className={styles.qt}>
                  <span className={styles.desc}>
                    {expenseCount} entr{expenseCount === 1 ? 'y' : 'ies'} logged
                  </span>
                  <span className={styles.amt}>{fmtCAD(spent)}</span>
                </div>
              ) : (
                <div className={styles.quotesEmpty}>
                  No expenses logged yet. Add this vendor to your plan, then use{' '}
                  <b>+ Add Expense</b> to track what you actually paid. Your entries are anonymous and
                  feed the average-spend numbers we'll show other planners.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
