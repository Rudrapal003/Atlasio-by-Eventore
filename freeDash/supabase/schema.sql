-- =========================================================
-- freeDash schema
-- Lives in the same Supabase project as the main Eventore app,
-- but everything is prefixed fd_ so the two surfaces stay
-- cleanly separable.
-- =========================================================

-- ---------- Vendors ----------
create table if not exists public.fd_vendors (
  id              text primary key,           -- slug, also used in URLs
  name            text not null,
  cat             text not null,              -- 'venue' | 'photo' | …
  lat             double precision not null,
  lng             double precision not null,
  area            text not null,
  price           smallint not null check (price between 1 and 4),
  rating          numeric(2,1) not null default 0,
  brief           text not null,
  email           text,
  phone           text,
  web             text,
  quotes          jsonb not null default '[]'::jsonb,

  -- monetization (a): sponsored placement
  sponsored       boolean not null default false,
  sponsored_until timestamptz,

  -- monetization (b): affiliate-tracked outbound URL
  outbound_url    text,

  -- editorial hygiene
  status          text not null default 'active' check (status in ('active','hidden','draft')),
  verified_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists fd_vendors_cat_idx        on public.fd_vendors (cat);
create index if not exists fd_vendors_status_idx     on public.fd_vendors (status);
create index if not exists fd_vendors_sponsored_idx  on public.fd_vendors (sponsored) where sponsored = true;

-- Auto-clear sponsored when the sponsored_until window passes
create or replace function public.fd_clear_expired_sponsored()
returns void language sql as $$
  update public.fd_vendors
     set sponsored = false
   where sponsored = true
     and sponsored_until is not null
     and sponsored_until < now();
$$;

-- ---------- Anonymous community-contributed quotes ----------
create table if not exists public.fd_quotes_anon (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   text not null references public.fd_vendors(id) on delete cascade,
  tier        text not null,        -- e.g. "100 guests / full evening"
  amount      text not null,        -- formatted string e.g. "$8,400"
  amount_num  numeric,              -- best-effort parsed numeric for sorting/stats
  visitor_id  text,                 -- random localStorage id; not a user
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists fd_quotes_vendor_idx on public.fd_quotes_anon (vendor_id);

-- ---------- Outbound click tracking (monetization b) ----------
create table if not exists public.fd_outbound_clicks (
  id           bigserial primary key,
  visitor_id   text not null,
  vendor_id    text not null references public.fd_vendors(id) on delete cascade,
  target_url   text not null,
  surface      text not null check (surface in ('vendor-card','plan-drawer','category-list')),
  sponsored    boolean not null default false,
  referrer     text,
  created_at   timestamptz not null default now()
);
create index if not exists fd_clicks_vendor_idx on public.fd_outbound_clicks (vendor_id, created_at desc);
create index if not exists fd_clicks_sponsored_idx on public.fd_outbound_clicks (sponsored, created_at desc);

-- ---------- Crowdsourced expense logs ----------
-- Each row is one expense a planner logged against a vendor in their plan.
-- Aggregated for the "average spent here" stats on vendor cards + as
-- leverage when atlasio later approaches vendors directly ("here's what
-- your real customers paid this year"). Never tied to a known user — only
-- visitor_id (random localStorage value) ever leaves the device.
create table if not exists public.fd_vendor_expenses (
  id          bigserial primary key,
  visitor_id  text not null,
  vendor_id   text not null references public.fd_vendors(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  label       text not null check (label in (
                 'deposit','progress-payment','final-payment','tasting',
                 'consultation','travel-fee','add-on','other')),
  spent_on    date,
  created_at  timestamptz not null default now()
);
create index if not exists fd_exp_vendor_idx on public.fd_vendor_expenses (vendor_id, created_at desc);
create index if not exists fd_exp_label_idx  on public.fd_vendor_expenses (vendor_id, label);

-- View: average + median spent per vendor, broken out by label,
-- safe to expose to the client because no individual rows leak.
create or replace view public.fd_vendor_expense_summary as
  select
    vendor_id,
    label,
    count(*)            as entries,
    round(avg(amount))  as avg_amount,
    percentile_cont(0.5) within group (order by amount) as median_amount,
    min(amount)         as min_amount,
    max(amount)         as max_amount
  from public.fd_vendor_expenses
  group by vendor_id, label
  having count(*) >= 3;  -- privacy floor — never expose stats based on < 3 entries

-- ---------- Authenticated user plans (for signed-in sync; guests use localStorage) ----------
create table if not exists public.fd_plans (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.fd_vendors           enable row level security;
alter table public.fd_quotes_anon       enable row level security;
alter table public.fd_outbound_clicks   enable row level security;
alter table public.fd_vendor_expenses   enable row level security;
alter table public.fd_plans             enable row level security;

-- Vendors: anyone can read 'active'; only service role can write
drop policy if exists fd_vendors_read on public.fd_vendors;
create policy fd_vendors_read on public.fd_vendors
  for select using (status = 'active');

-- Quotes: anyone can insert (unverified); only approved are read
drop policy if exists fd_quotes_insert on public.fd_quotes_anon;
create policy fd_quotes_insert on public.fd_quotes_anon
  for insert with check (true);

drop policy if exists fd_quotes_read on public.fd_quotes_anon;
create policy fd_quotes_read on public.fd_quotes_anon
  for select using (approved = true);

-- Outbound clicks: anyone can insert; only service role can read
drop policy if exists fd_clicks_insert on public.fd_outbound_clicks;
create policy fd_clicks_insert on public.fd_outbound_clicks
  for insert with check (true);

-- Expense logs: anyone can insert their own log; the raw table is not
-- readable from the client (only the aggregated view is).
drop policy if exists fd_exp_insert on public.fd_vendor_expenses;
create policy fd_exp_insert on public.fd_vendor_expenses
  for insert with check (true);

-- Plans: only the owning user can read/write their own row
drop policy if exists fd_plans_self on public.fd_plans;
create policy fd_plans_self on public.fd_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
