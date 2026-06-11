-- Insert dummy users into profiles first (normally done by trigger, but for seed we mock it)
-- Note: You MUST create an auth user in the Supabase Dashboard first, then link their UUID here. 
-- Since we can't seed auth.users easily via SQL without passing passwords, 
-- we will just insert raw vendors assuming RLS is temporarily disabled for seeding.

-- Assuming we have some valid UUIDs, we'll generate random ones for the seed:
INSERT INTO vendors (id, business_name, category, starting_price, location, latitude, longitude, rating, review_count, is_approved, portfolio_urls)
VALUES
(gen_random_uuid(), 'The Fairmont Hotel', 'Venue', 15000, 'Vancouver, BC', 49.2838, -123.1193, 4.9, 124, true, ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80']),
(gen_random_uuid(), 'Lumina Photography', 'Photographer', 3500, 'Vancouver, BC', 49.2600, -123.1139, 4.8, 56, true, ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80']),
(gen_random_uuid(), 'Hawksworth Catering', 'Caterer', 150, 'Vancouver, BC', 49.2827, -123.1207, 5.0, 210, true, ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80']),
(gen_random_uuid(), 'DJ Apex', 'DJ', 1200, 'Vancouver, BC', 49.2781, -123.1162, 4.7, 89, true, ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80']),
(gen_random_uuid(), 'Blossom & Vine', 'Decor', 2000, 'Vancouver, BC', 49.2635, -123.1385, 4.9, 43, true, ARRAY['https://images.unsplash.com/photo-1521102941031-15582f34220b?auto=format&fit=crop&w=800&q=80']);
