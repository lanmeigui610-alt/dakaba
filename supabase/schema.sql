create extension if not exists pgcrypto;

create type visibility_type as enum ('private', 'public');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '哒咔用户',
  avatar_url text,
  bio text,
  is_banned boolean not null default false,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_recovery (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  security_question text not null,
  security_answer_hash text not null,
  updated_at timestamptz not null default now()
);

create table public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  media_urls text[] not null default '{}',
  visibility visibility_type not null,
  mood text,
  tags text[] not null default '{}',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.moment_likes (
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);

create table public.diaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  body text not null,
  mood text,
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  plan_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.countdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_date date not null,
  color text default '#52d273',
  created_at timestamptz not null default now()
);

create table public.birthdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  birthday date not null,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  ip inet,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.account_recovery enable row level security;
alter table public.moments enable row level security;
alter table public.comments enable row level security;
alter table public.moment_likes enable row level security;
alter table public.diaries enable row level security;
alter table public.plans enable row level security;
alter table public.countdowns enable row level security;
alter table public.birthdays enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles are visible to signed in users"
on public.profiles for select to authenticated
using (true);

create policy "account recovery only owner"
on public.account_recovery for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users update own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users insert own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nickname', '哒咔用户'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, nickname)
select id, coalesce(raw_user_meta_data ->> 'nickname', '哒咔用户')
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
  values (auth.uid(), '哒咔用户')
  on conflict (id) do nothing;

  select * into profile_row
  from public.profiles
  where id = auth.uid();

  return profile_row;
end;
$$;

create policy "public moments visible and private only owner"
on public.moments for select to authenticated
using (visibility = 'public' or user_id = auth.uid());

create policy "users insert own moments"
on public.moments for insert to authenticated
with check (user_id = auth.uid());

create policy "users update own moments"
on public.moments for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users delete own moments"
on public.moments for delete to authenticated
using (user_id = auth.uid());

create policy "comments visible only when moment visible"
on public.comments for select to authenticated
using (
  exists (
    select 1 from public.moments m
    where m.id = comments.moment_id
    and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

create policy "comment public moments or own moments"
on public.comments for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.moments m
    where m.id = comments.moment_id
    and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

create policy "likes visible only when moment visible"
on public.moment_likes for select to authenticated
using (
  exists (
    select 1 from public.moments m
    where m.id = moment_likes.moment_id
    and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

create policy "like public moments or own moments"
on public.moment_likes for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.moments m
    where m.id = moment_likes.moment_id
    and (m.visibility = 'public' or m.user_id = auth.uid())
  )
);

create policy "private diaries only owner"
on public.diaries for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "plans only owner"
on public.plans for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "countdowns only owner"
on public.countdowns for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "birthdays only owner"
on public.birthdays for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users see own logs only"
on public.activity_logs for select to authenticated
using (user_id = auth.uid());

create or replace function public.get_private_review(range_name text)
returns jsonb
language sql
security invoker
stable
as $$
  select jsonb_build_object(
    'range', range_name,
    'plans_done', (
      select count(*) from public.plans
      where user_id = auth.uid()
      and completed = true
      and created_at >= case
        when range_name = 'week' then now() - interval '7 days'
        when range_name = 'year' then now() - interval '1 year'
        else now() - interval '1 month'
      end
    ),
    'diary_days', (
      select count(*) from public.diaries
      where user_id = auth.uid()
      and created_at >= case
        when range_name = 'week' then now() - interval '7 days'
        when range_name = 'year' then now() - interval '1 year'
        else now() - interval '1 month'
      end
    )
  );
$$;

create or replace function public.get_admin_stats()
returns jsonb
language sql
security invoker
stable
as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
      jsonb_build_object(
        'total_users', (select count(*) from public.profiles),
        'today_active_users', (select count(distinct user_id) from public.activity_logs where created_at >= current_date),
        'total_checkins', (select count(*) from public.plans where completed = true),
        'storage_mb', 0
      )
    else
      jsonb_build_object('error', 'admin only')
  end;
$$;

create or replace function public.get_admin_users()
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
  order by u.created_at desc;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moment-media', 'moment-media', true, 512000, array['image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "users upload own moment media"
on storage.objects for insert to authenticated
with check (bucket_id = 'moment-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public can read moment media"
on storage.objects for select to authenticated
using (bucket_id = 'moment-media');
