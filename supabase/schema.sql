-- GigConnect Supabase Schema (Full Tables + RLS)

-- Profiles (users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  role text default 'JobSeeker',
  approved boolean default true,
  profile_bio text,
  skills text[],
  portfolio_links text[],
  experience_level text,
  availability text,
  company_name text,
  company_description text,
  website text,
  industry text,
  bank_details jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs
create table if not exists jobs (
  id text primary key,
  employer_id uuid references profiles(id) on delete set null,
  title text,
  description text,
  category text,
  payment numeric,
  deadline timestamptz,
  status text,
  created_at timestamptz default now(),
  is_featured boolean default false,
  hired_user_id uuid references profiles(id) on delete set null,
  payment_status text,
  paid_amount numeric,
  platform_fee numeric,
  paid_at timestamptz
);

-- Applications
create table if not exists applications (
  id text primary key,
  job_id text references jobs(id) on delete cascade,
  job_seeker_id uuid references profiles(id) on delete set null,
  cover_letter text,
  status text,
  applied_at timestamptz
);

-- Messages
create table if not exists messages (
  id text primary key,
  from_user_id uuid references profiles(id) on delete set null,
  to_user_id uuid references profiles(id) on delete set null,
  content text,
  timestamp timestamptz,
  is_read boolean default false
);

-- Notifications
create table if not exists notifications (
  id text primary key,
  user_id uuid references profiles(id) on delete set null,
  message text,
  link jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id text primary key,
  job_id text references jobs(id) on delete set null,
  reviewer_id uuid references profiles(id) on delete set null,
  reviewee_id uuid references profiles(id) on delete set null,
  rating int,
  comment text,
  created_at timestamptz default now()
);

-- Subscribers
create table if not exists subscribers (
  id text primary key,
  email text unique,
  phone text,
  subscribed_at timestamptz default now()
);

-- Blog Posts
create table if not exists blog_posts (
  id text primary key,
  title text,
  slug text unique,
  excerpt text,
  content text,
  category text,
  tags text[],
  author_name text,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz,
  published_at timestamptz,
  cover_image text,
  is_ai boolean default false,
  source text
);

-- Wallet Transactions
create table if not exists wallet_transactions (
  id text primary key,
  user_id uuid references profiles(id) on delete set null,
  direction text,
  type text,
  amount numeric,
  description text,
  job_id text references jobs(id) on delete set null,
  created_at timestamptz default now()
);

-- Payout Requests
create table if not exists payout_requests (
  id text primary key,
  user_id uuid references profiles(id) on delete set null,
  amount numeric,
  method text,
  bank_details jsonb,
  status text,
  note text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- Platform Transactions
create table if not exists platform_transactions (
  id text primary key,
  amount numeric,
  job_id text references jobs(id) on delete set null,
  payer_id uuid references profiles(id) on delete set null,
  payee_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  description text
);

-- RLS
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table reviews enable row level security;
alter table subscribers enable row level security;
alter table blog_posts enable row level security;
alter table wallet_transactions enable row level security;
alter table payout_requests enable row level security;
alter table platform_transactions enable row level security;

-- Helper function: check admin role
create or replace function is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles p where p.id = uid and p.role = 'Admin'
  );
$$;

-- Profiles policies
create policy "Profiles: self or admin select"
on profiles for select
using (auth.uid() = id or is_admin(auth.uid()));

create policy "Profiles: self insert"
on profiles for insert
with check (auth.uid() = id);

create policy "Profiles: self or admin update"
on profiles for update
using (auth.uid() = id or is_admin(auth.uid()))
with check (auth.uid() = id or is_admin(auth.uid()));

-- Jobs policies
create policy "Jobs: public read open"
on jobs for select
using (status = 'Open');

create policy "Jobs: authenticated read"
on jobs for select
using (auth.role() = 'authenticated');

create policy "Jobs: employer insert"
on jobs for insert
with check (auth.uid() = employer_id or is_admin(auth.uid()));

create policy "Jobs: employer update"
on jobs for update
using (auth.uid() = employer_id or is_admin(auth.uid()))
with check (auth.uid() = employer_id or is_admin(auth.uid()));

-- Applications policies
create policy "Applications: seeker insert"
on applications for insert
with check (
  auth.uid() = job_seeker_id
  or is_admin(auth.uid())
  or exists (
    select 1 from jobs j
    where j.id = applications.job_id
    and j.employer_id = auth.uid()
  )
);

create policy "Applications: read own or employer"
on applications for select
using (
  auth.uid() = job_seeker_id
  or is_admin(auth.uid())
  or exists (
    select 1 from jobs j
    where j.id = applications.job_id
    and j.employer_id = auth.uid()
  )
);

create policy "Applications: employer update"
on applications for update
using (
  is_admin(auth.uid())
  or exists (
    select 1 from jobs j
    where j.id = applications.job_id
    and j.employer_id = auth.uid()
  )
);

-- Messages policies
create policy "Messages: participants read"
on messages for select
using (
  auth.uid() = from_user_id
  or auth.uid() = to_user_id
  or is_admin(auth.uid())
);

create policy "Messages: sender insert"
on messages for insert
with check (auth.uid() = from_user_id or is_admin(auth.uid()));

create policy "Messages: participants update"
on messages for update
using (
  auth.uid() = from_user_id
  or auth.uid() = to_user_id
  or is_admin(auth.uid())
);

-- Notifications policies (permissive for frontend-only ops)
create policy "Notifications: self read"
on notifications for select
using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Notifications: authenticated insert"
on notifications for insert
with check (auth.role() = 'authenticated');

create policy "Notifications: self update"
on notifications for update
using (auth.uid() = user_id or is_admin(auth.uid()));

-- Reviews policies
create policy "Reviews: read by parties"
on reviews for select
using (
  auth.uid() = reviewer_id
  or auth.uid() = reviewee_id
  or is_admin(auth.uid())
);

create policy "Reviews: reviewer insert"
on reviews for insert
with check (auth.uid() = reviewer_id);

-- Subscribers policies
create policy "Subscribers: public insert"
on subscribers for insert
with check (true);

create policy "Subscribers: admin read"
on subscribers for select
using (is_admin(auth.uid()));

-- Blog posts policies
create policy "Blog: public read published"
on blog_posts for select
using (status = 'Published');

create policy "Blog: admin read"
on blog_posts for select
using (is_admin(auth.uid()));

create policy "Blog: admin insert"
on blog_posts for insert
with check (is_admin(auth.uid()));

create policy "Blog: admin update"
on blog_posts for update
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Wallet transactions policies (limited)
create policy "Wallet: owner read"
on wallet_transactions for select
using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Wallet: owner insert"
on wallet_transactions for insert
with check (auth.role() = 'authenticated');

-- Payout requests policies
create policy "Payouts: owner read"
on payout_requests for select
using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Payouts: owner insert"
on payout_requests for insert
with check (auth.uid() = user_id or is_admin(auth.uid()));

create policy "Payouts: admin update"
on payout_requests for update
using (is_admin(auth.uid()));

-- Platform transactions policies
create policy "Platform: admin read"
on platform_transactions for select
using (is_admin(auth.uid()));

create policy "Platform: admin insert"
on platform_transactions for insert
with check (auth.role() = 'authenticated');
