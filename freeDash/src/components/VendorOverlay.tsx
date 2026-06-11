import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Vendor } from '@/types';
import { catById } from '@/data/categories';
import { priceLabel, stars } from '@/lib/format';
import { resolveOutboundUrl, trackOutboundClick } from '@/lib/tracking';
import styles from './VendorOverlay.module.css';

interface Props {
  vendor: Vendor;
  inPlan: boolean;
  onClose: () => void;
  onTogglePlan: () => void;
}

/* =========================================================
   Floating vendor card. Bottom-left of the map. Animates in.
   "Visit website" fires the outbound tracking beacon and then
   navigates — both invisible to the user.
   ========================================================= */

export function VendorOverlay({ vendor, inPlan, onClose, onTogglePlan }: Props) {
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
    const txt = `${vendor.name}\nEmail: ${vendor.email}\nPhone: ${vendor.phone}\nWeb: ${vendor.web}`;
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
        <div className={styles.priceTag}>{priceLabel(vendor.price)}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{vendor.name}</div>
        <div className={styles.meta}>
          <span className={styles.star}>{stars(vendor.rating)}</span>
          <span>·</span>
          <span>{vendor.area}</span>
        </div>
        <p className={styles.brief}>{vendor.brief}</p>

        <div className={styles.contactGrid}>
          <div className={styles.contactCell}>
            <div className={styles.lbl}>Email</div>
            <div className={styles.val}>{vendor.email}</div>
          </div>
          <div className={styles.contactCell}>
            <div className={styles.lbl}>Phone</div>
            <div className={styles.val}>{vendor.phone}</div>
          </div>
          <div className={`${styles.contactCell} ${styles.full}`}>
            <div className={styles.lbl}>Website</div>
            <div className={styles.val}>{vendor.web}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btnPrimary} ${inPlan ? styles.inPlan : ''}`}
            onClick={onTogglePlan}
          >
            {inPlan ? '✓ In your plan' : 'Add to my plan'}
          </button>
          <button className={styles.btnSecondary} onClick={handleVisit}>
            <ExternalLink size={14} />
            Visit
          </button>
          <button className={styles.btnSecondary} onClick={handleCopy}>
            {copyState === 'copied' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <div className={styles.sectionTitle}>Known quotes</div>
        <div className={styles.quotes}>
          {vendor.quotes.length ? (
            vendor.quotes.map((q, i) => (
              <div key={i} className={styles.qt}>
                <span className={styles.desc}>{q.tier}</span>
                <span className={styles.amt}>{q.amount}</span>
              </div>
            ))
          ) : (
            <div className={styles.quotesEmpty}>
              No quotes yet. Log one anonymously once you receive one — it helps the next couple.
            </div>
          )}
          <button className={styles.addQuote}>+ Log a quote</button>
        </div>
      </div>
    </div>
  );
}
