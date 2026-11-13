-- Phase 1: projects table with Row Level Security.

create extension if not exists "pgcrypto";

create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title        text not null check (char_length(btrim(title)) between 1 and 200),
  description  text check (description is null or char_length(description) <= 5000),
  video_type   text not null check (video_type in ('youtube_long','youtube_short','instagram_reel','tiktok')),
  aspect_ratio text not null check (aspect_ratio in ('16:9','9:16','1:1')),
  status       text not null default 'draft' check (status in ('draft','in_progress','completed','failed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_user_updated_idx on public.projects (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.projects force row level security;

create policy "projects_select_own" on public.projects
  for select to authenticated using (user_id = auth.uid());

create policy "projects_insert_own" on public.projects
  for insert to authenticated with check (user_id = auth.uid());

create policy "projects_update_own" on public.projects
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "projects_delete_own" on public.projects
  for delete to authenticated using (user_id = auth.uid());
