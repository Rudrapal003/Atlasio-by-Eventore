-- Eventore Database Schema
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

-- 7. Tasks (Event timeline & vendor coordination)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'not started' CHECK (status IN ('not started', 'in progress', 'blocked', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  assigned_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Task Comments
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Task Attachments
CREATE TABLE task_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Task Reminders
CREATE TABLE task_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;

-- Planners can access tasks for their events. Vendors can access tasks assigned to them or their associated event.
CREATE POLICY "Users can see tasks related to them" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.planner_id = auth.uid()
  )
  OR auth.uid() = assigned_to_user_id
  OR EXISTS (
    SELECT 1 FROM inquiries WHERE inquiries.event_id = tasks.event_id AND inquiries.vendor_id = auth.uid()
  )
);

CREATE POLICY "Users can manage tasks related to them" ON tasks ALL USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.planner_id = auth.uid()
  )
  OR auth.uid() = assigned_to_user_id
);

-- Comments are viewable if task is viewable. Planners/assignees can post.
CREATE POLICY "Users can see task comments" ON task_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_comments.task_id)
);
CREATE POLICY "Users can post task comments" ON task_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attachments are viewable if task is viewable
CREATE POLICY "Users can see task attachments" ON task_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_attachments.task_id)
);
CREATE POLICY "Users can post task attachments" ON task_attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by_user_id);

-- Reminders
CREATE POLICY "Users can see their task reminders" ON task_reminders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_reminders.task_id 
    AND (tasks.assigned_to_user_id = auth.uid() OR EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.planner_id = auth.uid()))
  )
);
CREATE POLICY "Users can manage their task reminders" ON task_reminders ALL USING (
  EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_reminders.task_id 
    AND (tasks.assigned_to_user_id = auth.uid() OR EXISTS (SELECT 1 FROM events WHERE events.id = tasks.event_id AND events.planner_id = auth.uid()))
  )
);

-- 11. Guests (RSVP Management)
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  plus_one INTEGER DEFAULT 0,
  dietary_restrictions TEXT,
  group_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planners can manage guests for their events" ON guests ALL USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = guests.event_id AND events.planner_id = auth.uid())
);
