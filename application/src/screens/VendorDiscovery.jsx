import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Map, Settings, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Deterministic pseudo-availability so the demo behaves like a real calendar:
// each vendor "owns" a set of unavailable date strings — if the event date
// falls in that set we hide the Available badge (and gray the card later).
const unavailableFor = (vendorId, dateStr) => {
  if (!dateStr) return false;
  // Stable hash: vendorId × day-of-year. ~30% of dates are blocked per vendor.
  const day = new Date(dateStr).getTime() / 86400000 | 0;
  return ((vendorId * 73 + day * 17) % 10) < 3;
};

// Next N open dates for a vendor starting from `from`. Skips blocked days.
const nextOpenDates = (vendorId, from, n = 3) => {
  const out = [];
  const start = from ? new Date(from) : new Date();
  let cursor = new Date(start);
  let safety = 60; // never scan more than 60 days ahead
  while (out.length < n && safety > 0) {
    cursor.setDate(cursor.getDate() + 1);
    if (!unavailableFor(vendorId, cursor.toISOString())) {
      out.push(new Date(cursor));
    }
    safety -= 1;
  }
  return out;
};

const formatShortDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// The VENDORS array is now fetched dynamically from Supabase.

const VendorDiscovery = () => {
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [showCultural, setShowCultural] = useState(true);
  const [maxReply, setMaxReply] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Hoist event-derived values so both the render JSX and the memo can read them.
  const ev = state.event || {};
  const eventTitle    = ev.title || "Your Event";
  const eventDate     = ev.date || null;
  const eventGuests   = ev.guests || state.guests || 100;
  const eventBudget   = ev.budget || state.budget || 60000;
  const eventLocation = ev.location || 'Vancouver, BC';
  const culturalTags  = ev.culturalTags || [];

  React.useEffect(() => {
    const fetchVendors = async () => {
      // QA Bypass
      if (localStorage.getItem('QA_MODE') === 'true') {
        const mockVendors = [
          {
            id: 1,
            name: "Lumina Events",
            category: "Venues",
            tagline: "Stunning waterfront views and full catering.",
            rating: 4.9,
            reviews: 128,
            price_min: 5000,
            price_max: 15000,
            price_type: "flat",
            location: "Vancouver, BC",
            pro_status: "premium",
            cultural_specialties: ["South Asian"],
            languages: ["English", "Punjabi"],
            reply_time_hours: 2,
            cover_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
            gallery_urls: [],
            packages: [],
            features: [],
            lat: 49.2827,
            lng: -123.1207
          },
          {
            id: 2,
            name: "DJ Spark",
            category: "Music",
            tagline: "The best beats in town.",
            rating: 4.7,
            reviews: 84,
            price_min: 1000,
            price_max: 3000,
            price_type: "flat",
            location: "Vancouver, BC",
            pro_status: "pro",
            cultural_specialties: [],
            languages: ["English"],
            reply_time_hours: 1,
            cover_url: "https://images.unsplash.com/photo-1571266028243-cb40fce7572d?auto=format&fit=crop&q=80&w=800",
            gallery_urls: [],
            packages: [],
            features: [],
            lat: 49.281,
            lng: -123.111
          }
        ];
        setVendors(mockVendors);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*');
      if (error) {
        console.error('Error fetching vendors:', error);
      } else {
        setVendors(data || []);
      }
      setLoading(false);
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
        cultural: culturalScore({ tags: v.category }),
        replyMins: 120,
        nextDates: nextOpenDates(v.id, eventDate, 3),
        location: v.location || 'Unknown',
        languages: v.languages || ['English']
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendors, eventDate, eventGuests, eventBudget, culturalTags.join('|')]);

  // Fuzzy city match: either the vendor city appears in the event location string or vice versa
  const cityMatch = (vendorLoc, eventLoc) => {
    if (!vendorLoc || !eventLoc) return true; // show all if no location set
    const vCity = vendorLoc.split(',')[0].trim().toLowerCase();
    const eCity = eventLoc.split(',')[0].trim().toLowerCase();
    return vCity === eCity || vendorLoc.toLowerCase().includes(eCity) || eventLoc.toLowerCase().includes(vCity);
  };

  const filteredVendors = vendorsWithAvail
    .filter(v => activeTab === 'All'
      ? true
      : (v.category.toLowerCase().includes(activeTab.toLowerCase()) || activeTab.toLowerCase().includes(v.category.toLowerCase())))
    .filter(v => hideUnavailable ? v.available : true)
    .filter(v => cityMatch(v.location, eventLocation))
    .filter(v => selectedLanguage ? v.languages.includes(selectedLanguage) : true)
    // Sort: available first → cultural match → rating
    .sort((a, b) =>
      (b.available - a.available) ||
      (b.cultural - a.cultural) ||
      (b.rating - a.rating)
    );

  const availableCount = filteredVendors.filter(v => v.available).length;
  const categories = ['All', 'Caterers', 'Venues', 'Decor', 'Anchor'];
  const hasLocationVendors = vendorsWithAvail.length > 0
    ? vendorsWithAvail.some(v => cityMatch(v.location, eventLocation))
    : true; // while loading, assume vendors exist
  
  const allLanguages = Array.from(new Set(vendorsWithAvail.flatMap(v => v.languages || []))).sort();

  return (
    <div className="screen-body">
      <div className="s2-top">
        <div className="s2-top-row">
          <div>
            <h6 className="s2-title">{eventTitle}<small>{formatDate(eventDate)} · {eventGuests} guests</small></h6>
          </div>
          <div className="s2-icons">
            <button aria-label="Toggle Map" onClick={() => setShowMap(!showMap)} className="s2-mini-icon" style={{ background: showMap ? 'var(--ink)' : 'transparent', color: showMap ? 'white' : 'var(--ink)', border: 'none', cursor: 'pointer' }}><Map size={16} /></button>
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
              background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px dashed var(--line)', color: 'var(--muted)', cursor: 'pointer'
            }}>
              {showCultural ? 'Ignore tags' : 'Use my tags'}
            </span>
          )}
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', color: 'var(--ink)', border: '1px solid var(--line)', outline: 'none'
            }}
          >
            <option value="">Any Language</option>
            {allLanguages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
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

      <div className="s2-list" style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px', position: 'relative' }}>
        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
        ) : showMap ? (
          <div style={{ height: '100%', background: 'var(--bg)', borderRadius: 12, margin: 16, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', border: '1px solid var(--line)' }}>
            <div style={{ padding: 12, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--line)', zIndex: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: 'var(--ink)' }}>Map View</h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>{filteredVendors.length} vendors in {eventLocation}</p>
            </div>
            
            <div style={{ flex: 1, position: 'relative' }}>
              {filteredVendors.length === 0 ? (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', padding: '16px 24px', borderRadius: 99, boxShadow: 'var(--shadow-sm)', zIndex: 1000, border: 'var(--glass-border)' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>No vendors found here.</p>
                </div>
              ) : null}
              
              <MapContainer 
                center={[49.2827, -123.1207]} 
                zoom={12} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                />
                {filteredVendors.map((vendor, i) => {
                  // Fallback for mock data missing lat/lng (generate deterministic fake coords around center)
                  const lat = vendor.latitude || (49.2827 + (Math.sin(vendor.id) * 0.05));
                  const lng = vendor.longitude || (-123.1207 + (Math.cos(vendor.id) * 0.05));
                  
                  const iconHtml = `<div style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;"><div style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 700; box-shadow: var(--shadow-md); white-space: nowrap;">$${vendor.priceFrom.toLocaleString()}</div><div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid var(--primary);"></div></div>`;
                  
                  const priceIcon = new L.DivIcon({
                    className: 'custom-pin',
                    html: iconHtml,
                    iconSize: [60, 40],
                    iconAnchor: [30, 40]
                  });

                  return (
                    <Marker key={vendor.id} position={[lat, lng]} icon={priceIcon}>
                      <Popup>
                        <Link to={`/vendor/${vendor.id}`} onClick={() => updateState({ selectedVendor: vendor })} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <strong style={{ display: 'block', fontSize: 14 }}>{vendor.name}</strong>
                          <span style={{ fontSize: 12, color: '#666' }}>{vendor.category} &bull; {vendor.rating} ★</span>
                        </Link>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
          </div>
        ) : !hasLocationVendors ? (
          <div style={{ textAlign: 'center', padding: '60px 32px', color: 'var(--ink)' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 16 }}>We're expanding! ✈️</h2>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Eventore is coming to <b>{eventLocation}</b> soon. We are actively onboarding the best premium vendors in this region.
            </p>
            <button style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Join the Waitlist
            </button>
          </div>
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
                {vendor.nextDates && vendor.nextDates.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0 4px', fontSize: 10 }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600, marginRight: 2 }}>Open:</span>
                    {vendor.nextDates.map((d, i) => (
                      <span key={i} style={{
                        padding: '2px 7px', borderRadius: 999,
                        background: 'var(--green-soft)', color: 'var(--green)',
                        fontWeight: 600
                      }}>{formatShortDate(d)}</span>
                    ))}
                  </div>
                )}
                <div className="vbottom">
                  <span className="vprice">From ${vendor.priceFrom.toLocaleString()} <small>{vendor.priceUnit}</small></span>
                  {vendor.available ? (
                    <span className="badge badge-available">● Available</span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171' }}>● Booked</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredVendors.length === 0 && hasLocationVendors && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
            No vendors match your filters. Try changing the date or showing all.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDiscovery;
