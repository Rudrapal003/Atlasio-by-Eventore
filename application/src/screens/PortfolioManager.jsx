import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Plus, Trash2, Globe } from 'lucide-react';

// Inline SVG for Instagram — installed lucide-react version doesn't export brand icons.
const Instagram = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const PortfolioManager = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [photos, setPhotos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newUrl, setNewUrl] = React.useState('');

  React.useEffect(() => {
    const fetchPortfolio = async () => {
      if (!state.user?.id) return;
      
      // QA Bypass
      if (localStorage.getItem('QA_MODE') === 'true') {
        setPhotos([
          { id: 1, url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800', source: 'Instagram' },
          { id: 2, url: 'https://images.unsplash.com/photo-1571266028243-cb40fce7572d?auto=format&fit=crop&q=80&w=800', source: 'Manual' }
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('portfolio_urls')
          .eq('id', state.user.id)
          .single();

        if (error) throw error;
        setPhotos(data.portfolio_urls?.map((url, idx) => ({ id: idx, url, source: 'Manual' })) || []);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [state.user?.id]);

  const handleAddPhoto = () => {
    setShowAddModal(true);
  };

  const submitNewPhoto = () => {
    if (newUrl) {
      updatePortfolio([...photos.map(p => p.url), newUrl]);
      setNewUrl('');
    }
    setShowAddModal(false);
  };

  const handleDelete = (url) => {
    if (confirm('Delete this photo?')) {
      updatePortfolio(photos.filter(p => p.url !== url).map(p => p.url));
    }
  };

  const updatePortfolio = async (newUrls) => {
    // QA Bypass
    if (localStorage.getItem('QA_MODE') === 'true') {
      setPhotos(newUrls.map((url, idx) => ({ id: idx, url, source: 'Manual' })));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ portfolio_urls: newUrls })
        .eq('id', state.user.id);

      if (error) throw error;
      setPhotos(newUrls.map((url, idx) => ({ id: idx, url, source: 'Manual' })));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="screen-body theme-creator">
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft size={24} color="var(--ink)" />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Portfolio</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRadius: '16px', border: '1px solid var(--line)', padding: '16px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700 }}>Connected Accounts</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#E1306C' }}>
              <Instagram size={14} /> @elite_decor
            </div>
            <div style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#EA4335' }}>
              <Globe size={14} /> Google Verified
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>My Photos</h3>
          <button 
            onClick={handleAddPhoto}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {loading ? (
             <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
          ) : (
            <React.Fragment>
              {photos.map(p => (
                <div key={p.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={p.url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    <span
                      onClick={() => handleDelete(p.url)}
                      style={{ background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '8px', color: 'white', fontSize: '10px' }}>
                    Source: {p.source}
                  </div>
                </div>
              ))}
            </React.Fragment>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '80%' }}>
            <h3 style={{ margin: '0 0 16px' }}>Add Image URL</h3>
            <input 
              type="text" 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '16px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: 'none', background: '#f1f5f9', borderRadius: '8px' }}>Cancel</button>
              <button onClick={submitNewPhoto} style={{ padding: '8px 16px', border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
