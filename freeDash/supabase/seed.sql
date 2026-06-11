-- =========================================================
-- freeDash — seed vendors
-- This is a *placeholder* seed mirroring src/data/vendors.json.
-- Production seed will be generated from
-- ../../Eventore_Vendor_Target_Tracker.xlsx via the outreach/
-- Python pipeline (hygiene-checked: website live, email valid,
-- category right).
-- =========================================================

insert into public.fd_vendors (id, name, cat, lat, lng, area, price, rating, brief, email, phone, web, sponsored, quotes)
values
  ('v01', 'Driftwood Pavilion',        'venue',     49.3010, -123.1417, 'Stanley Park',  4, 4.8, 'Open-air heritage pavilion with forest backdrop. Seats 140 indoors, 280 with tent.', 'events@driftwoodpavilion.ca', '(604) 555-0117', 'driftwoodpavilion.ca', false, '[{"tier":"100 guests / full evening","amount":"$8,400"}]'::jsonb),
  ('v02', 'Brick & Birch',             'venue',     49.2750, -123.1216, 'Yaletown',      3, 4.6, 'Industrial-loft event space with exposed brick, original beams, and a long west-facing window wall.', 'hello@brickbirch.com', '(604) 555-0132', 'brickbirch.com', false, '[{"tier":"80 guests / 6h","amount":"$5,200"}]'::jsonb),
  ('v03', 'The Glasshouse',            'venue',     49.2829, -123.1107, 'Downtown',      4, 4.9, 'Rooftop botanical conservatory with panoramic harbour views and on-site bar program.', 'bookings@glasshousevan.ca', '(604) 555-0149', 'glasshousevan.ca', true,  '[]'::jsonb),
  ('v04', 'Cedar & Sea Estate',        'venue',     49.2535, -123.2516, 'UBC',           3, 4.5, 'Coastal estate near Wreck Beach. Garden ceremony plus tented reception lawn.', 'events@cedarsea.ca', '(604) 555-0163', 'cedarsea.ca', false, '[{"tier":"120 guests / full day","amount":"$11,500"}]'::jsonb),
  ('v05', 'Aurora Frame Studio',       'photo',     49.2738, -123.0950, 'Strathcona',    3, 4.9, 'Documentary-style wedding and event photography, two-shooter teams.', 'studio@auroraframe.ca', '(604) 555-0188', 'auroraframe.ca', false, '[{"tier":"8h coverage","amount":"$3,600"}]'::jsonb),
  ('v06', 'Ember & Oak Photo',         'photo',     49.2670, -123.1530, 'Kitsilano',     2, 4.7, 'Light-led portrait and editorial coverage. Includes engagement session.', 'hi@emberoak.co', '(604) 555-0204', 'emberoak.co', false, '[]'::jsonb),
  ('v07', 'Pacific Light Photography', 'photo',     49.2630, -123.0991, 'Mt Pleasant',   3, 4.8, 'Editorial coverage with film + digital. Specializes in golden-hour ceremonies.', 'team@paclight.ca', '(604) 555-0211', 'paclight.ca', true,  '[{"tier":"10h + 2 shooters","amount":"$4,800"}]'::jsonb),
  ('v08', 'Saltwater Kitchen',         'catering',  49.2625, -123.0840, 'East Van',      3, 4.7, 'Coastal seasonal menus, in-house pastry, full bar program with BC-only wine list.', 'events@saltwaterkitchen.ca', '(604) 555-0237', 'saltwaterkitchen.ca', false, '[{"tier":"plated / 100 guests","amount":"$11,200"}]'::jsonb),
  ('v09', 'Foragefire Catering',       'catering',  49.2831, -123.1145, 'Downtown',      4, 4.9, 'Open-fire and live-fire stations. Chef-driven seasonal tasting menus.', 'kitchen@foragefire.ca', '(604) 555-0258', 'foragefire.ca', false, '[{"tier":"family-style / 120 guests","amount":"$14,800"}]'::jsonb),
  ('v10', 'Bloomline Florals',         'florals',   49.2671, -123.1610, 'Kitsilano',     3, 4.8, 'Locally-grown garden-style installations and ceremony arches.', 'hello@bloomline.ca', '(604) 555-0269', 'bloomline.ca', false, '[{"tier":"ceremony + 10 centerpieces","amount":"$3,200"}]'::jsonb),
  ('v11', 'Wildgrove Flowers',         'florals',   49.2823, -123.1050, 'Gastown',       2, 4.6, 'Wild, foraged-style florals with emphasis on local growers and dried elements.', 'shop@wildgrove.ca', '(604) 555-0277', 'wildgrove.ca', false, '[]'::jsonb),
  ('v12', 'Marvel Sound DJ',           'dj',        49.2761, -123.1230, 'Yaletown',      2, 4.7, 'Open-format DJ, multilingual MC, full lighting + sub kit included.', 'book@marvelsound.ca', '(604) 555-0282', 'marvelsound.ca', false, '[{"tier":"6h reception","amount":"$1,950"}]'::jsonb),
  ('v13', 'Tidal Audio Co.',           'dj',        49.2890, -123.1227, 'Coal Harbour',  3, 4.8, 'Live-band-meets-DJ hybrid sets, modular stage and live sax option.', 'events@tidalaudio.ca', '(604) 555-0299', 'tidalaudio.ca', false, '[]'::jsonb),
  ('v14', 'Maeve Lane Planning',       'planning',  49.2754, -123.1281, 'Yaletown',      4, 4.9, 'Full-service planning and design, average 12-month engagement.', 'studio@maevelane.ca', '(604) 555-0301', 'maevelane.ca', true,  '[{"tier":"full planning, 12 mo","amount":"$9,500"}]'::jsonb),
  ('v15', 'Coastal Curated Events',    'planning',  49.2697, -123.1561, 'Kitsilano',     3, 4.6, 'Partial planning + month-of coordination packages.', 'hello@coastalcurated.ca', '(604) 555-0316', 'coastalcurated.ca', false, '[]'::jsonb),
  ('v16', 'Powder & Petal Cakes',      'cake',      49.2826, -123.1010, 'Gastown',       2, 4.8, 'Floral-pressed butter-cream cakes, organic ingredients, gluten-free options.', 'hello@powderpetal.ca', '(604) 555-0322', 'powderpetal.ca', false, '[{"tier":"3-tier / 80 servings","amount":"$680"}]'::jsonb),
  ('v17', 'Glow Bridal Beauty',        'beauty',    49.2789, -123.1284, 'Yaletown',      3, 4.9, 'On-location hair + airbrush makeup teams, available across the Lower Mainland.', 'team@glowbridal.ca', '(604) 555-0339', 'glowbridal.ca', false, '[{"tier":"bride + 4 guests","amount":"$1,250"}]'::jsonb),
  ('v18', 'Rev. Sara Holm',            'officiant', 49.2640, -123.0991, 'Mt Pleasant',   1, 4.9, 'Non-denominational and bilingual ceremonies, rehearsal included.', 'sara@holmceremonies.ca', '(604) 555-0344', 'holmceremonies.ca', false, '[{"tier":"ceremony + rehearsal","amount":"$650"}]'::jsonb)
on conflict (id) do nothing;
