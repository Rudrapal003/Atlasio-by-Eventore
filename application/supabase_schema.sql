-- Eventore Supabase Schema Setup

-- 1. Profiles Table
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  user_type     TEXT CHECK (user_type IN ('planner','creator')) NOT NULL,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'userType', NEW.raw_user_meta_data->>'user_type', 'planner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Vendors Table
CREATE TABLE vendors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name     TEXT NOT NULL,
  category          TEXT NOT NULL,  
  description       TEXT,
  starting_price    NUMERIC,
  location          TEXT,           
  latitude          NUMERIC,        
  longitude         NUMERIC,        
  portfolio_urls    TEXT[],         
  tags              TEXT[],
  languages         TEXT[],
  rating            NUMERIC DEFAULT 0,
  review_count      INT DEFAULT 0,
  is_approved       BOOLEAN DEFAULT FALSE,  
  agreement_signed  BOOLEAN DEFAULT FALSE,
  agreement_signed_at TIMESTAMPTZ,
  stripe_account_id TEXT,           
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendor manages own profile" ON vendors FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public can read approved vendors" ON vendors FOR SELECT USING (is_approved = TRUE);

-- 3. Events Table
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT,
  date        DATE,
  guests      INT,
  budget      NUMERIC,
  location    TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON events FOR ALL USING (user_id = auth.uid());

-- 4. Inquiries Table
CREATE TABLE inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id  UUID REFERENCES profiles(id),
  vendor_id   UUID REFERENCES vendors(id),
  event_id    UUID REFERENCES events(id),
  message     TEXT,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','responded','declined','booked')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planner or vendor can view their inquiries" ON inquiries FOR SELECT 
  USING (planner_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- 5. Messages Table
CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id        UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id         UUID REFERENCES profiles(id),
  recipient_id      UUID REFERENCES profiles(id),
  body              TEXT NOT NULL,
  booking_confirmed BOOLEAN DEFAULT FALSE,
  read              BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read messages" ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 6. Bookings Table
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id      UUID REFERENCES inquiries(id),
  planner_id      UUID REFERENCES profiles(id),
  vendor_id       UUID REFERENCES vendors(id),
  event_id        UUID REFERENCES events(id),
  package_name    TEXT,
  amount          NUMERIC NOT NULL,
  platform_fee    NUMERIC,        
  payout_amount   NUMERIC,        
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','disputed','refunded')),
  stripe_payment_intent_id TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reviews Table
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES bookings(id),
  reviewer_id UUID REFERENCES profiles(id),
  vendor_id   UUID REFERENCES vendors(id),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors SET
    rating = (SELECT AVG(rating) FROM reviews WHERE vendor_id = NEW.vendor_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = NEW.vendor_id)
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_inserted AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

-- 8. Agreements Table
CREATE TABLE agreements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  type        TEXT CHECK (type IN ('vendor','planner')),
  version     TEXT NOT NULL,         
  signed_at   TIMESTAMPTZ DEFAULT NOW(),
  ip_address  TEXT,
  user_agent  TEXT
);

-- 9. Vendor Packages Table
CREATE TABLE vendor_packages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC NOT NULL,
  description TEXT,
  includes    TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
