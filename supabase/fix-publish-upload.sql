-- DakaBa Supabase repair/update script
-- Run this once in Supabase SQL Editor. It is safe to run repeatedly.

create extension if not exists pgcrypto;

alter table if exists public.profiles
add column if not exists is_banned boolean not null default false,
add column if not exists updated_at timestamptz not null default now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nickname', 'DakaBa User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, nickname)
select id, coalesce(raw_user_meta_data ->> 'nickname', 'DakaBa User')
from auth.users
on conflict (id) do nothing;

create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql
security invoker
set search_path = public
as $$
declare
  profile_row public.profiles;
begin
  insert into public.profiles (id, nickname)
  values (auth.uid(), 'DakaBa User')
  on conflict (id) do nothing;

  select * into profile_row
  from public.profiles
  where id = auth.uid();

  return profile_row;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moment-media', 'moment-media', true, 512000, array['image/webp', 'image/gif'])
on conflict (id) do update
set public = true,
    file_size_limit = 512000,
    allowed_mime_types = array['image/webp', 'image/gif'];

drop policy if exists "users upload own moment media" on storage.objects;
create policy "users upload own moment media"
on storage.objects for insert to authenticated
with check (bucket_id = 'moment-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "public can read moment media" on storage.objects;
create policy "public can read moment media"
on storage.objects for select to authenticated
using (bucket_id = 'moment-media');

drop policy if exists "users insert own moments" on public.moments;
drop policy if exists "users can insert own moments" on public.moments;
create policy "users insert own moments"
on public.moments for insert to authenticated
with check (
  user_id = auth.uid()
  and (
    visibility = 'private'
    or not exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_banned, false) = true
    )
  )
);

alter table if exists public.comments
add column if not exists emoji text,
add column if not exists parent_id uuid references public.comments(id) on delete cascade;

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

drop policy if exists "comment likes visible when comment visible" on public.comment_likes;
create policy "comment likes visible when comment visible"
on public.comment_likes for select to authenticated
using (
  exists (
    select 1
    from public.comments c
    join public.moments m on m.id = c.moment_id
    where c.id = comment_likes.comment_id
      and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

drop policy if exists "like visible comments" on public.comment_likes;
create policy "like visible comments"
on public.comment_likes for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.comments c
    join public.moments m on m.id = c.moment_id
    where c.id = comment_likes.comment_id
      and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

create table if not exists public.developer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  reply text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

alter table public.developer_feedback enable row level security;

drop policy if exists "public feedback visible to authenticated users" on public.developer_feedback;
create policy "public feedback visible to authenticated users"
on public.developer_feedback for select to authenticated
using (is_public = true or user_id = auth.uid());

drop policy if exists "users create own feedback" on public.developer_feedback;
create policy "users create own feedback"
on public.developer_feedback for insert to authenticated
with check (user_id = auth.uid());

-- Remove old no-argument admin RPCs to avoid PostgREST overload conflicts.
drop function if exists public.get_admin_stats();
drop function if exists public.get_admin_users();
drop function if exists public.get_admin_stats(text);
drop function if exists public.get_admin_users(text);
drop function if exists public.set_user_ban(uuid, boolean, text);
drop function if exists public.get_admin_feedback(text);
drop function if exists public.reply_developer_feedback(uuid, text, text);

create function public.get_admin_stats(admin_pin text default '')
returns json
language sql
security definer
set search_path = public, auth
as $$
  select case
    when admin_pin <> '2641' then json_build_object('error', 'invalid admin pin')
    else json_build_object(
      'total_users', (select count(*) from auth.users),
      'today_active_users', (select count(*) from auth.users where last_sign_in_at::date = now()::date),
      'total_checkins', (select count(*) from public.plans where completed = true),
      'storage_mb', 0
    )
  end;
$$;

create function public.get_admin_users(admin_pin text default '')
returns table (
  user_id uuid,
  account text,
  nickname text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_banned boolean,
  moment_count bigint,
  checkin_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  select
    u.id as user_id,
    coalesce(u.email, u.phone) as account,
    p.nickname,
    u.created_at,
    u.last_sign_in_at,
    coalesce(p.is_banned, false) as is_banned,
    (select count(*) from public.moments m where m.user_id = u.id) as moment_count,
    (select count(*) from public.plans pl where pl.user_id = u.id and pl.completed = true) as checkin_count
  from auth.users u
  left join public.profiles p on p.id = u.id
  where admin_pin = '2641'
  order by u.created_at desc;
$$;

create function public.set_user_ban(target_user_id uuid, banned boolean, admin_pin text default '')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if admin_pin <> '2641' then
    raise exception 'invalid admin pin';
  end if;

  update public.profiles
  set is_banned = banned,
      updated_at = now()
  where id = target_user_id;

  return true;
end;
$$;

create function public.get_admin_feedback(admin_pin text default '')
returns table (
  id uuid,
  user_id uuid,
  account text,
  nickname text,
  avatar_url text,
  body text,
  reply text,
  is_public boolean,
  created_at timestamptz,
  replied_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select
    f.id,
    f.user_id,
    coalesce(u.email, u.phone) as account,
    p.nickname,
    p.avatar_url,
    f.body,
    f.reply,
    f.is_public,
    f.created_at,
    f.replied_at
  from public.developer_feedback f
  left join public.profiles p on p.id = f.user_id
  left join auth.users u on u.id = f.user_id
  where admin_pin = '2641'
  order by f.created_at desc;
$$;

create function public.reply_developer_feedback(feedback_id uuid, reply_body text, admin_pin text default '')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if admin_pin <> '2641' then
    raise exception 'invalid admin pin';
  end if;

  update public.developer_feedback
  set reply = reply_body,
      replied_at = now()
  where id = feedback_id;

  return true;
end;
$$;
