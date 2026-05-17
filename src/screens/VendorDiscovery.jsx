import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Map, Settings, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabaseClient';

// Deterministic pseudo-availability so the demo behaves like a real calendar:
// each vendor "owns" a set of unavailable date strings — if the event date
// falls in that set we hide the Available badge (and gray the card later).
const unavailableFor = (vendorId, dateStr) => {
  if (!dateStr) return false;
  // Stable hash: vendorId × day-of-year. ~30% of dates are blocked per vendor.
  const day = new Date(dateStr).getTime() / 86400000 | 0;
  return ((vendorId * 73 + day * 17) % 10) < 3;
};

// The VENDORS array is now fetched dynamically from Supabase.

const VendorDiscovery = () => {
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [showCultural, setShowCultural] = useState(true);
  const [maxReply, setMaxReply] = useState(null);

  React.useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*');

        if (error) throw error;
        setVendors(data || []);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Score how well a vendor matches the planner's cultural tags. A tag matches
  // if any token of it appears in the vendor's tags string (case-insensitive).
  const culturalScore = (vendor) => {
    if (!culturalTags.length) return 0;
    const haystack = (vendor.tags || '').toLowerCase();
    return culturalTags.reduce((n, tag) => {
      const tokens = tag.toLowerCase().split(/[ /-]+/);
      return n + (tokens.some(t => haystack.includes(t)) ? 1 : 0);
    }, 0);
  };

  const formatDate = (d) => {
    if (!d) return 'No date set';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  // Compute availability + budget fit + cultural match per vendor, then sort.
  const vendorsWithAvail = useMemo(() => {
    const ev = state.event || {};
    const eventDate = ev.date || null;
    const eventGuests = ev.guests || 100;
    const eventBudget = ev.budget || 60000;
    const culturalTags = ev.culturalTags || [];

    return vendors.map(v => {
      const available = !unavailableFor(v.id, eventDate);
      const priceUnit = v.category?.toLowerCase().includes('cater') ? '/ guest' : '';
      const projected = priceUnit === '/ guest' ? v.starting_price * eventGuests : v.starting_price;
      const fitsBudget = projected <= eventBudget * 0.6;
      
      return {
        ...v,
        name: v.business_name,
        image: v.portfolio_urls?.[0] || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop&q=80',
        tags: v.category, // Defaulting tags to category for now
        priceFrom: v.starting_price || 0,
        priceUnit,
        replies: '~2h', // Mocking reply speed
        available,
        projected,
        fitsBudget,
        cultural: culturalScore({ tags: v.category }), // Mocking cultural score
        replyMins: 120
      };
    });
  }, [vendors, state.event, state.guests, state.budget]);

  const filteredVendors = vendorsWithAvail
    .filter(v => activeTab === 'All'
      ? true
      : (v.category.toLowerCase().includes(activeTab.toLowerCase()) || activeTab.toLowerCase().includes(v.category.toLowerCase())))
    .filter(v => hideUnavailable ? v.available : true)
    .filter(v => maxReply ? v.replyMins <= maxReply : true)
    // Sort: available first → cultural match → rating
    .sort((a, b) =>
      (b.available - a.available) ||
      (b.cultural - a.cultural) ||
      (b.rating - a.rating)
    );

  const availableCount = filteredVendors.filter(v => v.available).length;
  const categories = ['All', 'Caterers', 'Venues', 'Decor', 'Anchor'];

  return (
    <div className="screen-body">
      <div className="s2-top">
        <div className="s2-top-row">
          <div>
            <h6 className="s2-title">{eventTitle}<small>{formatDate(eventDate)} · {eventGuests} guests</small></h6>
          </div>
          <div className="s2-icons">
            <Link to="/discovery" className="s2-mini-icon"><Map size={16} /></Link>
            <Link to="/profile" className="s2-mini-icon"><Settings size={16} /></Link>
          </div>
        </div>
        <div className="s2-event-strip" style={{ background: 'var(--primary)' }}><span className="dot"></span> Budget ${eventBudget.toLocaleString()} · 25 mi · {eventLocation}</div>
      </div>

      <div className="s2-tabs">
        {categories.map(cat => (
          <span
            key={cat}
            className={`s2-tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
            style={{
              cursor: 'pointer',
              background: activeTab === cat ? 'var(--ink)' : 'var(--cream)',
              color: activeTab === cat ? 'white' : 'var(--muted)'
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Wizard-driven cultural chips + response-time filter */}
      {(culturalTags.length > 0 || true) && (
        <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {showCultural && culturalTags.map(tag => (
            <span key={tag} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: 'var(--primary-soft)', color: 'var(--primary)'
            }}>{tag}</span>
          ))}
          {culturalTags.length > 0 && (
            <span onClick={() => setShowCultural(s => !s)} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: 'white', border: '1px dashed var(--line)', color: 'var(--muted)', cursor: 'pointer'
            }}>
              {showCultural ? 'Ignore tags' : 'Use my tags'}
            </span>
          )}
          {[
            { label: 'Replies < 1h', val: 60 },
            { label: 'Replies < 4h', val: 240 },
            { label: 'Any reply',    val: null }
          ].map(opt => (
            <span key={opt.label} onClick={() => setMaxReply(opt.val)} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: maxReply === opt.val ? 'var(--ink)' : 'white',
              color:      maxReply === opt.val ? 'white' : 'var(--muted)',
              border: '1px solid var(--line)'
            }}>{opt.label}</span>
          ))}
        </div>
      )}

      <div className="s2-count-row">
        <span><b>{availableCount} vendors</b> available {eventDate ? `on ${formatDate(eventDate)}` : ''}</span>
        <span
          onClick={() => setHideUnavailable(h => !h)}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          title="Toggle showing unavailable vendors"
        >
          <SlidersHorizontal size={12} /> {hideUnavailable ? 'Available only' : 'Show all'}
        </span>
      </div>

      <div className="s2-list" style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : filteredVendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
            No vendors match your filters. Try changing the date or showing all.
          </div>
        ) : filteredVendors.map(vendor => (
          <Link
            key={vendor.id}
            to={`/vendor/${vendor.id}`}
            style={{ textDecoration: 'none', opacity: vendor.available ? 1 : 0.55 }}
            onClick={() => updateState({ selectedVendor: vendor })}
          >
            <div className="vcard">
              <div className="vphoto" style={{ backgroundImage: `url('${vendor.image}')` }}>
                <span className={`vpro ${vendor.type === 'Premium' ? 'vpremium' : ''}`} style={{ background: vendor.type === 'Premium' ? '' : 'var(--primary)' }}>
                  {vendor.type === 'Premium' ? '★ Premium' : 'PRO'}
                </span>
                <span className="heart">♥</span>
              </div>
              <div>
                <h6>{vendor.name}</h6>
                <p className="vtag">{vendor.tags}</p>
                <div className="vrating">
                  <span className="star">★</span> <b>{vendor.rating}</b> ({vendor.reviews}) <span className="sep">·</span> Replies {vendor.replies}
                </div>
                <div className="vbottom">
                  <span className="vprice">From ${vendor.priceFrom.toLocaleString()} <small>{vendor.priceUnit}</small></span>
                  {vendor.available ? (
                    <span className="badge badge-available">● Available</span>
                  ) : (
                    <span className="badge" style={{ background: '#FEE2E2', color: '#B91C1C' }}>● Booked</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredVendors.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
            No vendors match your filters. Try changing the date or showing all.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDiscovery;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  