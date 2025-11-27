-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Signatures Table
create table signatures (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  roomie_name text not null,
  signature_data text not null -- Base64 string of the canvas
);

-- 2. Payments Table (Rent, Services, Pool)
create table payments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  roomie_id text not null, -- 'alejandro', 'edgardo', 'james'
  amount numeric not null,
  status text default 'pending', -- 'pending', 'paid'
  type text not null, -- 'rent', 'service', 'pool'
  month_date date not null -- First day of the month (e.g., 2025-12-01)
);

-- 3. Chores Table
create table chores (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  assigned_to text, -- 'alejandro', 'edgardo', 'james', 'all'
  is_completed boolean default false,
  due_date date
);

-- Row Level Security (RLS) - Open for this demo (Vibra Alta mode: Trust)
alter table signatures enable row level security;
alter table payments enable row level security;
alter table chores enable row level security;

create policy "Enable read access for all users" on signatures for select using (true);
create policy "Enable insert access for all users" on signatures for insert with check (true);

create policy "Enable read access for all users" on payments for select using (true);
create policy "Enable insert access for all users" on payments for insert with check (true);
create policy "Enable update access for all users" on payments for update using (true);

create policy "Enable read access for all users" on chores for select using (true);
create policy "Enable insert access for all users" on chores for insert with check (true);
create policy "Enable update access for all users" on chores for update using (true);
