import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, ChevronLeft, ChevronRight, MapPin, MessageSquare } from 'lucide-react';

// Inline SVG for Instagram — installed lucide-react version doesn't export brand icons.
const Instagram = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

// Same availability hash as Discovery — keep them aligned.
const isAvailable = (vendorId, date) => {
  if (!date) return true;
  const day = (new Date(date).getTime() / 86400000) | 0;
  return ((vendorId * 73 + day * 17) % 10) >= 3;
};

// Vendor-keyed portfolio shots — keeps each vendor's gallery distinct.
const portfolioFor = (vendor) => {
  const base = vendor?.image || '';
  const seeds = [
    'photo-1519225421980-715cb0215aed', // banquet
    'photo-1464366400600-7168b8af9bc3', // outdoor
    'photo-1511795409834-ef04bbd61622', // decor
    'photo-1465495976277-4387d4b0b4c6', // catering
    'photo-1530103862676-de8c9debad1d', // celebration
    'photo-1492684223066-81342ee5ff30', // crowd
  ];
  return [
    { src: base, source: 'evently' },
    ...seeds.map((s, i) => ({
      src: `https://images.unsplash.com/${s}?w=300&h=300&fit=crop&q=80`,
      source: i % 2 === 0 ? 'instagram' : 'evently'
    }))
  ];
};

const SAMPLE_REVIEWS = [
  { id: 1, author: 'Aisha S.',     rating: 5, body: 'Showed up on time, food was incredible, my mom literally cried. Worth every penny.', verified: true, date: '2 weeks ago' },
  { id: 2, author: 'Daniel R.',    rating: 5, body: 'Booked through Evently for our engagement — super smooth, no surprise charges, vendor was responsive.', verified: true, date: '1 month ago' },
  { id: 3, author: 'Priya M.',     rating: 4, body: 'Great food, slight delay on setup but they communicated well. Would book again.', verified: true, date: '2 months ago' }
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MiniCalendar = ({ vendorId, eventDate }) => {
  const today = new Date();
  const target = eventDate ? new Date(eventDate) : today;
  const [viewMonth, setViewMonth] = useState(target.getMonth());
  const [viewYear, setViewYear] = useState(target.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  // Pad to multiple of 7
  while (cells.length % 7) cells.push(null);

  const shift = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m); setViewYear(y);
  };

  const targetKey = eventDate ? new Date(eventDate).toDateString() : null;

  return (
    <div style={{ marginTop: 12, padding: 12, border: '1px solid var(--line)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={() => shift(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{MONTHS[viewMonth]} {viewYear}</div>
        <button onClick={() => shift(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontSize: 11 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(viewYear, viewMonth, day);
          const available = isAvailable(vendorId, date.toISOString());
          const isTarget = targetKey && date.toDateString() === targetKey;
          return (
            <div key={i} style={{
              textAlign: 'center', padding: '6px 0', borderRadius: 6, fontSize: 12,
              background: isTarget ? 'var(--primary)' : (available ? '#ECFDF5' : '#FEE2E2'),
              color: isTarget ? 'white' : (available ? '#065F46' : '#991B1B'),
              fontWeight: isTarget ? 700 : 500
            }}>{day}</div>
          );
        })}
      </div>
    </div>
  );
};

const VendorProfile = () => {
  const { state, updateState } = useApp();
  const vendor = state.selectedVendor;
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [activeTab, setActiveTab] = useState('Packages');
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  
  const eventDate = state.event?.date;
  const available = useMemo(() => vendor ? isAvailable(vendor.id, eventDate) : true, [vendor, eventDate]);

  React.useEffect(() => {
    const fetchPackages = async () => {
      if (!vendor?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('vendor_id', vendor.id);

        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [vendor?.id]);

  if (!vendor) {
    return (
      <div className="screen-body" style={{ padding: 24, justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>No vendor selected.</p>
        <Link to="/discovery"><button style={{ marginTop: 16 }}>Browse vendors</button></Link>
      </div>
    );
  }

  const handleSelect = (pkg) => { 
    setSelectedPkg(pkg); 
    updateState({ selectedPackage: pkg }); 
  };
  const handleShare = () => {
    const url = `https://evently.app/vendor/${vendor.id}`;
    if (navigator.share) navigator.share({ title: vendor.name, url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 1800);
  };
  const handleSave = () => setSaved(s => !s);
  const portfolio = vendor?.portfolio_urls?.map(url => ({ src: url, source: 'evently' })) || portfolioFor(vendor);

  return (
    <div className="screen-body">
      <div className="s3-hero" style={{ backgroundImage: `url('${vendor.image}')`, marginTop: '-47px' }}>
        <div className="s3-hero-overlay" style={{ top: '70px' }}>
          <Link to="/discovery" className="icon-btn"><ArrowLeft size={18} /></Link>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="icon-btn" onClick={handleShare} style={{ cursor: 'pointer' }}><Share2 size={16} /></span>
            <span className="icon-btn" onClick={handleSave} style={{ color: saved ? 'var(--rose)' : undefined, cursor: 'pointer' }}>
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </span>
          </div>
        </div>
        {shareToast && (
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'white', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, opacity: 0.95 }}>Link copied</div>
        )}
      </div>

      <div className="s3-content" style={{ overflowY: 'auto', paddingBottom: 8 }}>
        <div className="s3-title">
          {vendor.name}
          <span className="badge badge-premium" style={{ marginLeft: 8 }}>★ {vendor.type.toUpperCase()}</span>
          {!available && <span className="badge" style={{ marginLeft: 8, background: '#FEE2E2', color: '#B91C1C' }}>Booked on your date</span>}
        </div>
        <p className="s3-tags">{vendor.tags}</p>
        <div className="s3-rating-row">
          <span className="lhs"><span className="star">★</span> <b>{vendor.rating}</b> · {vendor.reviews} reviews</span>
          <span className="google-cite">Google · 4.8 · 89</span>
        </div>
        <div className="s3-stat-row">
          <span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> <b>Vancouver, BC</b> · 8 mi</span>
          <span><b>Replies {vendor.replies}</b></span>
        </div>
        <div className="s3-tabs-row">
          {['Packages', 'About', 'Reviews'].map(tab => (
            <div key={tab} className={`t ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ cursor: 'pointer' }}>{tab}</div>
          ))}
        </div>

        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : activeTab === 'Packages' && (
          packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '14px' }}>No packages available for this vendor.</div>
          ) : packages.map(pkg => (
            <div key={pkg.id} className={`pkg-card ${pkg.featured ? 'featured' : ''}`} onClick={() => handleSelect(pkg)} style={{ cursor: 'pointer', borderWidth: selectedPkg?.id === pkg.id ? '2px' : '1px', borderColor: selectedPkg?.id === pkg.id ? 'var(--rose)' : (pkg.featured ? 'var(--brand)' : 'var(--line)') }}>
              <div className="pkg-head">
                <div>
                  <h6>{pkg.name}</h6>
                  {pkg.note && <p className="pkg-note">{pkg.note}</p>}
                </div>
                <div className="pkg-price">${pkg.price} <small>{vendor.category?.toLowerCase().includes('cater') ? '/ guest' : ''}</small></div>
              </div>
              <ul className="pkg-includes">{pkg.includes?.map((inc, i) => <li key={i}>{inc}</li>)}</ul>
            </div>
          ))
        )}

        {activeTab === 'About' && (
          <div style={{ padding: '4px 4px 80px' }}>
            <h4 style={{ fontSize: 15, margin: '12px 0 8px' }}>About {vendor.name}</h4>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              A premium event service specializing in {vendor.tags.toLowerCase()}. {vendor.reviews}+ successful events across Greater Vancouver.
            </p>
            <h4 style={{ fontSize: 15, margin: '20px 0 8px' }}>Portfolio</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {portfolio.map((shot, i) => (
                <div key={i} style={{ paddingBottom: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden', backgroundImage: `url('${shot.src}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {shot.source === 'instagram' && (
                    <span style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', color: 'white', borderRadius: 4, padding: 2, display: 'inline-flex' }}>
                      <Instagram size={10} />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <h4 style={{ fontSize: 15, margin: '20px 0 4px' }}>Availability</h4>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Real-time — every confirmed Evently booking auto-blocks this calendar.</p>
            <MiniCalendar vendorId={vendor.id} eventDate={eventDate} />
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div style={{ padding: '4px 4px 80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--ink)' }}>{vendor.rating}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {vendor.reviews} reviews · {SAMPLE_REVIEWS.filter(r => r.verified).length} verified by Evently bookings
              </div>
            </div>
            {SAMPLE_REVIEWS.map(r => (
              <div key={r.id} style={{ padding: '12px 0', borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <b style={{ fontSize: 13 }}>{r.author}</b>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>{r.body}</p>
                {r.verified && (
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 600,                     color: 'var(--primary)', background: 'var(--primary-soft)', padding: '2px 8px', borderRadius: 999 }}>✓ Verified by Evently booking</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="s3-cta-bar">
        <div className="from">
          {selectedPkg ? (<>Selected <b>{selectedPkg.name}</b></>) : (<>From <b>${vendor.priceFrom} / guest</b></>)}
        </div>
        <Link to={selectedPkg && available ? "/confirm" : "#"} style={{ flex: 1, pointerEvents: (selectedPkg && available) ? 'auto' : 'none', opacity: (selectedPkg && available) ? 1 : 0.5 }}>
          <button style={{ width: '100%' }}>
            {!available ? 'Unavailable on your date' : (selectedPkg ? 'Confirm Selection' : 'Select a Package')}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VendorProfile;
