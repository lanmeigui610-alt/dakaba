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

create or replace function public.get_admin_stats(admin_pin text default '')
returns json
language sql
security definer
set search_path = public, auth
as $$
  select case
    when admin_pin <> '2641' then json_build_object('error', '管理员密码不正确')
    else json_build_object(
      'total_users', (select count(*) from auth.users),
      'today_active_users', (select count(*) from auth.users where last_sign_in_at::date = now()::date),
      'total_checkins', (select count(*) from public.plans where completed = true),
      'storage_mb', 0
    )
  end;
$$;

create or replace function public.get_admin_users(admin_pin text default '')
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

create or replace function public.set_user_ban(target_user_id uuid, banned boolean, admin_pin text default '')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if admin_pin <> '2641' then
    raise exception '管理员密码不正确';
  end if;

  update public.profiles
  set is_banned = banned,
      updated_at = now()
  where id = target_user_id;

  return true;
end;
$$;
