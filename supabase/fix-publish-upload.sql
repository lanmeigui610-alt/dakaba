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
