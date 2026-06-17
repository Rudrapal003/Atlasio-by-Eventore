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
  spent: number;
  expenseCount: number;
  onClose: () => void;
  onTogglePlan: () => void;
  isGuest?: boolean;
  onRequireAuth?: () => void;
}

// Curated Unsplash photo sets per category — 3 landscape photos each
// Using fixed Unsplash photo IDs (stable, no API key needed)
const CAT_PHOTOS: Record<string, [string, string, string]> = {
  venue:    [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=420&h=280&fit=crop&auto=format',
  ],
  photo:    [
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=420&h=280&fit=crop&auto=format',
  ],
  video:    [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=420&h=280&fit=crop&auto=format',
  ],
  catering: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=420&h=280&fit=crop&auto=format',
  ],
  decor:    [
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=420&h=280&fit=crop&auto=format',
  ],
  planner:  [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1532635239-06e08db8f247?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=420&h=280&fit=crop&auto=format',
  ],
  music:    [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=420&h=280&fit=crop&auto=format',
  ],
  florist:  [
    'https://images.unsplash.com/photo-1487530811015-780f2249c325?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc9c?w=420&h=280&fit=crop&auto=format',
  ],
  hair:     [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=420&h=280&fit=crop&auto=format',
  ],
  attire:   [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=420&h=280&fit=crop&auto=format',
  ],
  // fallbacks for any other cat ids
  florals:  [
    'https://images.unsplash.com/photo-1487530811015-780f2249c325?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc9c?w=420&h=280&fit=crop&auto=format',
  ],
  dj:       [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=420&h=280&fit=crop&auto=format',
  ],
  planning: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1532635239-06e08db8f247?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=420&h=280&fit=crop&auto=format',
  ],
  cake:     [
    'https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=420&h=280&fit=crop&auto=format',
  ],
  beauty:   [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=420&h=280&fit=crop&auto=format',
  ],
  officiant:[
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=420&h=280&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=420&h=280&fit=crop&auto=format',
  ],
};

const FALLBACK_PHOTOS: [string, string, string] = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=420&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=420&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=420&h=280&fit=crop&auto=format',
];

function getPhotos(cat: string): [string, string, string] {
  return CAT_PHOTOS[cat] ?? FALLBACK_PHOTOS;
}

export function VendorOverlay({ vendor, inPlan, spent, expenseCount, onClose, onTogglePlan, isGuest, onRequireAuth }: Props) {
  const c = catById(vendor.cat);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const photos = getPhotos(vendor.cat);

  const handleVisit = () => {
    const url = resolveOutboundUrl(vendor);
    void trackOutboundClick({ vendorId: vendor.id, targetUrl: url, surface: 'vendor-card', sponsored: vendor.sponsored });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    const lines = [
      vendor.name,
      vendor.email && `Email: ${vendor.email}`,
      vendor.phone && `Phone: ${vendor.phone}`,
      vendor.web && `Web: ${vendor.web}`,
    ].filter(Boolean);
    void navigator.clipboard?.writeText(lines.join('\n'));
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 1400);
  };

  return (
    <div className={`${styles.overlay} floatCard`}>
      <button className={styles.closeX} onClick={onClose} aria-label="Close">
        <X size={14} />
      </button>

      {/* Photo collage hero */}
      <div className={styles.hero}>
        <div className={styles.photoGrid}>
          <img src={photos[0]} alt="" className={styles.photoMain} loading="lazy" />
          <div className={styles.photoStack}>
            <img src={photos[1]} alt="" className={styles.photoSub} loading="lazy" />
            <img src={photos[2]} alt="" className={styles.photoSub} loading="lazy" />
          </div>
        </div>
        {/* Gradient overlay so badges stay legible */}
        <div className={styles.heroOverlay} style={{ ['--hero-c' as never]: c.hex } as never} />
        {vendor.sponsored && <div className={styles.sponsoredBadge}>★ Featured</div>}
        <div className={styles.catTag}>
          <span className={styles.dot} style={{ background: c.hex }} />
          {c.label}
        </div>
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
                  <b>+ Add Expense</b> to track what you actually paid.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
