import { createClient } from '@supabase/supabase-js';

// -------- Real Supabase if env vars are set, otherwise a friendly mock --------
//
// The mock returns sample data so the prototype walks end-to-end without
// requiring a Supabase backend. The moment you set VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY in a .env file, the real client takes over.

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'mock');

const MOCK_VENDORS = [
  {
    id: 'v-tandoor', business_name: 'Tandoor & Co', category: 'Caterers',
    starting_price: 75, rating: 4.9, reviews: 127, location: 'Vancouver, Canada', languages: ['English', 'Hindi', 'Punjabi'],
    portfolio_urls: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-crystal', business_name: 'Crystal Pavilion', category: 'Venues',
    starting_price: 5000, rating: 4.8, reviews: 210, location: 'Vancouver, Canada', languages: ['English'],
    portfolio_urls: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-bali-villa', business_name: 'The Edge Uluwatu', category: 'Venues',
    starting_price: 12000, rating: 5.0, reviews: 340, location: 'Bali, Indonesia', languages: ['English', 'Indonesian'],
    portfolio_urls: ['https://images.unsplash.com/photo-1543489822-c49534f3271f?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-paris-cater', business_name: 'Le Grand Feast', category: 'Caterers',
    starting_price: 150, rating: 4.9, reviews: 88, location: 'Paris, France', languages: ['French', 'English'],
    portfolio_urls: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-djsterling', business_name: 'DJ Sterling', category: 'DJ',
    starting_price: 1800, rating: 4.9, reviews: 203, location: 'New York, USA', languages: ['English', 'Spanish'],
    portfolio_urls: ['https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-mc-rahul', business_name: 'MC Rahul', category: 'Anchor',
    starting_price: 800, rating: 5.0, reviews: 32, location: 'Vancouver, Canada', languages: ['English', 'Hindi', 'Gujarati'],
    portfolio_urls: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-mc-sophie', business_name: 'Anchor Sophie', category: 'Anchor',
    starting_price: 1200, rating: 4.8, reviews: 54, location: 'Paris, France', languages: ['French', 'English', 'Spanish'],
    portfolio_urls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-santorini-decor', business_name: 'Aegean Aesthetics', category: 'Decor',
    starting_price: 3500, rating: 4.9, reviews: 112, location: 'Santorini, Greece', languages: ['Greek', 'English'],
    portfolio_urls: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-cancun-photo', business_name: 'Riviera Snaps', category: 'Photographer',
    starting_price: 2200, rating: 4.7, reviews: 145, location: 'Cancun, Mexico', languages: ['Spanish', 'English'],
    portfolio_urls: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=600&fit=crop&q=80']
  }
];

const MOCK_PACKAGES = [
  { id: 'p-royal', vendor_id: 'v-tandoor', name: 'Royal Buffet Package', price: 85, note: 'Most Popular', featured: true,
    includes: ['6 Apps, 4 Mains, 3 Desserts', 'Live Tandoor Station', 'Premium Linen & Cutlery'] },
  { id: 'p-classic', vendor_id: 'v-tandoor', name: 'Classic Celebration', price: 65, note: '', featured: false,
    includes: ['4 Apps, 3 Mains, 2 Desserts', 'Standard Linen & Cutlery'] }
];

// ---- Chainable query builder mock ----
const ok = (data) => Promise.resolve({ data, error: null });

const makeQuery = (table) => {
  const ctx = { table, filters: [], single: false, limitN: null };
  const collect = () => {
    let rows = [];
    if (table === 'vendors')  rows = [...MOCK_VENDORS];
    if (table === 'packages') rows = [...MOCK_PACKAGES];
    if (table === 'bookings' || table === 'events' || table === 'profiles' || table === 'inquiries') rows = [];
    // apply equality filters
    for (const f of ctx.filters) {
      rows = rows.filter(r => r[f.col] === f.val);
    }
    if (ctx.limitN) rows = rows.slice(0, ctx.limitN);
    if (ctx.single) return ok(rows[0] || null);
    return ok(rows);
  };
  const builder = {
    select() { return builder; },
    eq(col, val) { ctx.filters.push({ col, val }); return builder; },
    order() { return builder; },
    limit(n) { ctx.limitN = n; return builder; },
    single() { ctx.single = true; return collect(); },
    insert(rows) {
      const list = Array.isArray(rows) ? rows : [rows];
      const withIds = list.map(r => ({ id: r.id || 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), ...r }));
      // return a chainable result that still supports .select().single()
      return {
        select() {
          return {
            single: () => ok(withIds[0]),
            then: (fn) => Promise.resolve({ data: withIds, error: null }).then(fn)
          };
        },
        then: (fn) => Promise.resolve({ data: withIds, error: null }).then(fn)
      };
    },
    update() { return { eq: () => ok(null) }; },
    delete() { return { eq: () => ok(null) }; },
    then(fn) { return collect().then(fn); }
  };
  return builder;
};

const mockSupabase = {
  from: (table) => makeQuery(table),
  auth: {
    signUp: async ({ email, options }) => ({
      data: {
        user: {
          id: 'u_' + Date.now(),
          email,
          user_metadata: options?.data || {}
        }
      },
      error: null
    }),
    signInWithPassword: async ({ email }) => ({
      data: { user: { id: 'u_' + Date.now(), email } },
      error: null
    }),
    signInWithOtp: async ({ phone }) => ({
      data: { user: { id: 'u_' + Date.now(), phone } },
      error: null
    }),
    verifyOtp: async ({ phone, token, type }) => ({
      data: { session: { user: { id: 'u_' + Date.now(), phone } } },
      error: null
    }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;

if (!isConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[Eventore] Using mock Supabase (no VITE_SUPABASE_URL set). Sample data only.');
}
