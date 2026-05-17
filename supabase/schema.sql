-- Evently Database Schema
-- Phase 1 Foundation

-- 1. Profiles (Unified User Table)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('planner', 'creator')),
  phone_number TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendors (Detailed creator profiles)
CREATE TABLE vendors (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'photographer', 'catering', 'decor'
  bio TEXT,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  starting_price INTEGER,
  portfolio_urls TEXT[], -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Packages (Service bundles for vendors)
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  includes TEXT[], -- Array of features
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Events (Created by planners)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'wedding', 'birthday', etc.
  title TEXT,
  date DATE,
  guests INTEGER,
  budget INTEGER,
  location TEXT,
  cultural_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inquiries (Leads between planners and creators)
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES profiles(id),
  vendor_id UUID REFERENCES vendors(id),
  package_id UUID REFERENCES packages(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Messages (Real-time chat)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Vendors are viewable by everyone" ON vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can update their own info" ON vendors FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Packages are viewable by everyone" ON packages FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their packages" ON packages ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Planners can see their own events" ON events ALL USING (auth.uid() = planner_id);

CREATE POLICY "Parties can see their inquiries" ON inquiries FOR SELECT USING (auth.uid() = planner_id OR auth.uid() = vendor_id);
CREATE POLICY "Planners can create inquiries" ON inquiries FOR INSERT WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Parties can see their messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM inquiries 
    WHERE inquiries.id = messages.inquiry_id 
    AND (inquiries.planner_id = auth.uid() OR inquiries.vendor_id = auth.uid())
  )
);
CREATE POLICY "Parties can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
