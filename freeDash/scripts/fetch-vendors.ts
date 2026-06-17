import { createClient } from '@supabase/supabase-js';

// Load env vars (in production this would run via a Cron Job, Edge Function, or local .env)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

if (!GOOGLE_API_KEY) {
  console.warn("Missing GOOGLE_PLACES_API_KEY. Will run in mock mode.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const AREAS = ['Vancouver', 'Yaletown', 'Gastown', 'Kitsilano', 'North Vancouver'];
const CATEGORIES = [
  { id: 'venue', query: 'event venue' },
  { id: 'photo', query: 'wedding photographer' },
  { id: 'catering', query: 'event catering' },
];

/**
 * Mocks the Google Places Text Search if API key is not provided.
 * In production, it hits the Google Places API.
 */
async function searchPlaces(query: string, area: string) {
  if (!GOOGLE_API_KEY) {
    return [
      {
        id: `mock_${area}_${query}`.replace(/[^a-z0-9]/gi, ''),
        name: `Sample ${query} in ${area}`,
        lat: 49.28 + (Math.random() - 0.5) * 0.1,
        lng: -123.12 + (Math.random() - 0.5) * 0.1,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        vicinity: `${Math.floor(Math.random() * 900) + 100} Fake St, ${area}`,
        price_level: Math.floor(Math.random() * 3) + 1,
      }
    ];
  }

  const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + area)}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.results || [];
}

async function run() {
  console.log("Starting daily vendor sync...");
  let count = 0;

  for (const cat of CATEGORIES) {
    for (const area of AREAS) {
      console.log(`Fetching ${cat.query} in ${area}...`);
      try {
        const results = await searchPlaces(cat.query, area);
        
        for (const place of results) {
          // Construct the vendor object based on schema
          const vendorData = {
            id: place.place_id || place.id,
            name: place.name,
            cat: cat.id,
            lat: place.geometry?.location?.lat || place.lat,
            lng: place.geometry?.location?.lng || place.lng,
            area: area,
            price: place.price_level || 2, // 1 to 4
            rating: place.rating || 0,
            brief: place.vicinity || `A beautiful ${cat.query} located in ${area}.`,
            status: 'active',
            updated_at: new Date().toISOString()
          };

          // Upsert into Supabase
          const { error } = await supabase
            .from('fd_vendors')
            .upsert(vendorData, { onConflict: 'id' });

          if (error) {
            console.error(`Failed to upsert vendor ${vendorData.name}:`, error.message);
          } else {
            count++;
          }
        }
      } catch (err) {
        console.error(`Error fetching data for ${area} / ${cat.id}:`, err);
      }
    }
  }

  console.log(`Finished sync. Upserted ${count} vendors.`);
}

run();
