-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Connected Facebook Pages table
create table if not exists public.pages (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade null,
    fb_page_id text not null unique,
    page_name text not null,
    access_token text not null,
    system_prompt text default 'You are a helpful customer service assistant for this business. Be polite, concise, and helpful.',
    is_active boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Message History for context
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    fb_page_id text not null,
    sender_psid text not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_messages_psid on public.messages(fb_page_id, sender_psid, created_at desc);

-- Allow service role full access (RLS can be tightened later)
alter table public.pages enable row level security;
alter table public.messages enable row level security;

create policy "Service role full access pages"
  on public.pages for all
  using (true)
  with check (true);

create policy "Service role full access messages"
  on public.messages for all
  using (true)
  with check (true);
