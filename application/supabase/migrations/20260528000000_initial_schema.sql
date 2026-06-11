-- Eventore Initial Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Users & Vendors)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('host', 'vendor', 'admin')) default 'host',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VENDORS TABLE (Business specific info)
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null unique,
  business_name text not null,
  category text not null,
  description text,
  city text not null,
  website_url text,
  instagram_url text,
  stripe_account_id text, -- For Stripe Connect split payments
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SERVICES TABLE (What vendors offer)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  title text not null,
  description text,
  base_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. BOOKINGS TABLE (Inquiries and Confirmed bookings)
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  vendor_id uuid references public.vendors(id) on delete restrict not null,
  service_id uuid references public.services(id) on delete restrict not null,
  event_date date not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  total_amount numeric not null,
  eventore_fee numeric not null, -- 3% platform fee
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Profiles: Users can read and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Vendors: Anyone can read, only the vendor can update
create policy "Anyone can view vendors" on public.vendors for select using (true);
create policy "Vendors can update own business" on public.vendors for update using (auth.uid() = profile_id);

-- Services: Anyone can read, only the owning vendor can insert/update
create policy "Anyone can view services" on public.services for select using (true);
-- (Insert/Update policies for services require joining vendors table or passing claims)

-- Bookings: Hosts can see their own bookings, Vendors can see bookings assigned to them
create policy "Hosts can view own bookings" on public.bookings for select using (auth.uid() = host_id);
-- (Vendor viewing bookings requires joining vendors table)
