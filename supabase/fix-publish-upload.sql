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
