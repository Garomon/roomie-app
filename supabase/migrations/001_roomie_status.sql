-- Migration: Add roomie_status table for status/availability tracking
-- Created: 2025-12-06

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Create roomie_status table
create table if not exists roomie_status (
  id uuid default uuid_generate_v4() primary key,
  roomie_id text not null unique,
  status text default 'available' check (status in ('available', 'busy', 'dnd', 'lady_alert')),
  message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index if not exists idx_roomie_status_roomie_id on roomie_status(roomie_id);

-- Enable RLS
alter table roomie_status enable row level security;

-- Policies for roomie_status
create policy "Enable read access for all users" on roomie_status for select using (true);
create policy "Enable insert access for all users" on roomie_status for insert with check (true);
create policy "Enable update access for all users" on roomie_status for update using (true);

-- Insert default status for all roomies
insert into roomie_status (roomie_id, status) values 
  ('edgardo', 'available'),
  ('james', 'available'),
  ('alejandro', 'available')
on conflict (roomie_id) do nothing;
