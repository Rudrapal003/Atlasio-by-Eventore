import { createClient } from '@supabase/supabase-js';

// -------- Real Supabase if env vars are set, otherwise a friendly mock --------
//
// The mock returns sample data so the prototype walks end-to-end without
// requiring a Supabase backend. The moment you set VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY in a .env file, the real client takes over.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseAnonKey.includes('your-anon-key');

// ----- Sample data the mock returns (Vancouver-area friendly) -----
const MOCK_VENDORS = [
  {
    id: 'v-tandoor',
    business_name: 'Tandoor & Co',
    category: 'Caterers',
    starting_price: 75,
    rating: 4.9,
    reviews: 127,
    portfolio_urls: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-crystal',
    business_name: 'Crystal Pavilion',
    category: 'Venues',
    starting_price: 5000,
    rating: 4.8,
    reviews: 210,
    portfolio_urls: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-bloom',
    business_name: 'Bloom & Bough',
    category: 'Decor',
    starting_price: 2500,
    rating: 4.8,
    reviews: 89,
    portfolio_urls: ['https://images.unsplash.com/photo-1561128290-006dc4827214?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-djsterling',
    business_name: 'DJ Sterling',
    category: 'DJ',
    starting_price: 1800,
    rating: 4.9,
    reviews: 203,
    portfolio_urls: ['https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-mc-rahul',
    business_name: 'MC Rahul',
    category: 'Anchor',
    starting_price: 800,
    rating: 5.0,
    reviews: 32,
    portfolio_urls: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'v-rustic',
    business_name: 'The Rustic Barn',
    category: 'Venues',
    starting_price: 3500,
    rating: 4.6,
    reviews: 82,
    portfolio_urls: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=600&fit=crop&q=80']
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
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;

if (!isConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[Evently] Using mock Supabase (no VITE_SUPABASE_URL set). Sample data only.');
}
