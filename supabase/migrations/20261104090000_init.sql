-- ============================================================================
-- ÉCLAT Beauty Atelier — Supabase schema
-- Postgres 15+ / Supabase. Timezone of the salon: Europe/Moscow.
--
-- Tables: profiles, masters, services, master_services, master_schedules,
--         bookings, slot_blocks
-- Security: RLS on every table, owner helper, protected role column,
--           exclusion constraint against double bookings.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('client', 'owner', 'master');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- One row per Supabase Auth user. The id references auth.users, never a
-- separate credentials table: Supabase Auth owns identity.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '',
  role          public.user_role not null default 'client',
  avatar_url    text,
  -- Optional legacy password hash. Supabase Auth owns credentials in
  -- production; the column exists only for the self-contained local demo
  -- and must stay null for real Supabase users.
  password_hash text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- New auth users automatically get a client profile. Role is deliberately
-- never taken from user-editable metadata — owners are promoted manually or
-- from a trusted server process.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table public.services (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text not null default '',
  category          text not null check (category in ('HAIR', 'NAILS', 'SKIN', 'MAKEUP', 'BROWS', 'LASER', 'PODOLOGY')),
  duration_minutes  integer not null check (duration_minutes between 15 and 600),
  price             integer not null check (price >= 0), -- rubles, no kopecks
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index services_active_order_idx on public.services (is_active, sort_order);
create trigger services_touch_updated_at
before update on public.services
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- masters
-- ---------------------------------------------------------------------------
create table public.masters (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid references public.profiles (id) on delete set null,
  slug              text not null unique,
  name              text not null,
  bio               text not null default '',
  photo_url         text not null default '',
  rating            real not null default 5.0 check (rating between 0 and 5),
  specialization    text not null default '',
  experience_years  integer not null default 1 check (experience_years between 0 and 70),
  reviews_count     integer not null default 0 check (reviews_count >= 0),
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index masters_active_order_idx on public.masters (is_active, sort_order);
create trigger masters_touch_updated_at
before update on public.masters
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- master_services (many-to-many)
-- ---------------------------------------------------------------------------
create table public.master_services (
  master_id  uuid not null references public.masters (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (master_id, service_id)
);

create index master_services_service_idx on public.master_services (service_id);

-- ---------------------------------------------------------------------------
-- master_schedules
-- Recurring weekly availability. day_of_week uses ISO-8601: 1 = Monday,
-- 7 = Sunday. Several intervals per day are allowed (e.g. lunch split).
-- ---------------------------------------------------------------------------
create table public.master_schedules (
  id           uuid primary key default gen_random_uuid(),
  master_id    uuid not null references public.masters (id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 1 and 7),
  start_time   time not null,
  end_time     time not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint master_schedules_time_order check (start_time < end_time),
  constraint master_schedules_unique_slot unique (master_id, day_of_week, start_time)
);

create index master_schedules_master_idx on public.master_schedules (master_id, day_of_week);
create trigger master_schedules_touch_updated_at
before update on public.master_schedules
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- bookings
-- Status is lower-case at the DB layer and mapped to UI labels in the app.
-- ---------------------------------------------------------------------------
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique default (
    'ECL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  client_id      uuid references public.profiles (id) on delete set null,
  master_id      uuid not null references public.masters (id) on delete restrict,
  service_id     uuid not null references public.services (id) on delete restrict,
  customer_name  text not null check (char_length(trim(customer_name)) >= 2),
  customer_phone text not null check (char_length(customer_phone) >= 10),
  customer_email text,
  notes          text,
  start_time     timestamptz not null,
  end_time       timestamptz not null,
  status         public.booking_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint bookings_time_order check (end_time > start_time)
);

create index bookings_master_start_idx on public.bookings (master_id, start_time);
create index bookings_client_idx on public.bookings (client_id, start_time desc);
create index bookings_status_start_idx on public.bookings (status, start_time);

create trigger bookings_touch_updated_at
before update on public.bookings
for each row execute function public.touch_updated_at();

-- The database — not only the UI — guarantees that one master cannot have
-- two overlapping active bookings. This closes the race condition between
-- two guests submitting the same slot at the same time.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    master_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

-- Recalculate end_time server-side from the service duration. A client can
-- never extend a visit by tampering with the request payload.
create or replace function public.set_booking_end_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
begin
  select duration_minutes into v_duration
  from public.services
  where id = new.service_id and is_active = true;

  if v_duration is null then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.master_services
    where master_id = new.master_id and service_id = new.service_id
  ) then
    raise exception 'MASTER_DOES_NOT_PROVIDE_SERVICE' using errcode = 'P0001';
  end if;

  new.end_time := new.start_time + make_interval(mins => v_duration);
  return new;
end;
$$;

create trigger bookings_set_end_time
before insert or update of start_time, service_id, master_id on public.bookings
for each row execute function public.set_booking_end_time();

-- ---------------------------------------------------------------------------
-- slot_blocks
-- Manual "busy" slots created by the owner (personal time, training, etc.).
-- ---------------------------------------------------------------------------
create table public.slot_blocks (
  id         uuid primary key default gen_random_uuid(),
  master_id  uuid not null references public.masters (id) on delete cascade,
  start_time timestamptz not null,
  end_time   timestamptz not null,
  reason     text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint slot_blocks_time_order check (end_time > start_time),
  constraint slot_blocks_unique_start unique (master_id, start_time)
);

create index slot_blocks_master_start_idx on public.slot_blocks (master_id, start_time);

-- ---------------------------------------------------------------------------
-- Helper: is the current JWT owner? SECURITY DEFINER avoids recursive RLS
-- evaluation when policies on profiles itself call this function.
-- ---------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
-- Public policies call this helper as part of an OR expression. Anon must be
-- able to execute it (it returns false when auth.uid() is null).
grant execute on function public.is_owner() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Availability RPC
-- Returns free "HH:MM" slots for one master/service/day, respecting the
-- weekly schedule, service duration, bookings and manual blocks.
--
-- The Next.js API is the only caller in this project (service key), but the
-- function is also safe for direct supabase-js calls from the browser.
-- ---------------------------------------------------------------------------
create or replace function public.get_available_slots(
  p_master_id  uuid,
  p_service_id uuid,
  p_date       date,
  p_timezone   text default 'Europe/Moscow'
)
returns table (slot_time text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_day      smallint := extract(isodow from p_date)::smallint;
  v_schedule record;
  v_slot     timestamptz;
  v_slot_end timestamptz;
  v_day_end  timestamptz;
begin
  -- Never let a caller inject an arbitrary timezone identifier through SQL.
  if p_timezone not in ('Europe/Moscow', 'UTC') then
    raise exception 'UNSUPPORTED_TIMEZONE';
  end if;

  select duration_minutes into v_duration
  from public.services
  where id = p_service_id and is_active = true;

  if v_duration is null then
    return;
  end if;

  if not exists (
    select 1 from public.masters m
    join public.master_services ms on ms.master_id = m.id
    where m.id = p_master_id and m.is_active = true and ms.service_id = p_service_id
  ) then
    return;
  end if;

  for v_schedule in
    select start_time, end_time
    from public.master_schedules
    where master_id = p_master_id
      and day_of_week = v_day
      and is_active = true
    order by start_time
  loop
    v_slot := (p_date + v_schedule.start_time) at time zone p_timezone;
    v_day_end := (p_date + v_schedule.end_time) at time zone p_timezone;

    while v_slot + make_interval(mins => v_duration) <= v_day_end loop
      v_slot_end := v_slot + make_interval(mins => v_duration);

      -- Only future slots, at least 30 minutes ahead.
      if v_slot > now() + interval '30 minutes'
         and not exists (
           select 1 from public.bookings b
           where b.master_id = p_master_id
             and b.status in ('pending', 'confirmed')
             and tstzrange(b.start_time, b.end_time, '[)') && tstzrange(v_slot, v_slot_end, '[)')
         )
         and not exists (
           select 1 from public.slot_blocks sb
           where sb.master_id = p_master_id
             and tstzrange(sb.start_time, sb.end_time, '[)') && tstzrange(v_slot, v_slot_end, '[)')
         )
      then
        slot_time := to_char(v_slot at time zone p_timezone, 'HH24:MI');
        return next;
      end if;

      v_slot := v_slot + interval '30 minutes';
    end loop;
  end loop;
end;
$$;

revoke all on function public.get_available_slots(uuid, uuid, date, text) from public;
grant execute on function public.get_available_slots(uuid, uuid, date, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Grants (RLS still restricts row access)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.services, public.masters, public.master_services,
  public.master_schedules to anon, authenticated;

-- Raw blocked intervals can contain private notes ("личное время"), so they
-- are not readable by anonymous visitors. Availability is exposed through the
-- SECURITY DEFINER RPC below, which returns only free start times.
grant select, insert, update, delete on public.services, public.masters,
  public.master_services, public.master_schedules, public.slot_blocks
  to authenticated;

grant select, insert, update on public.bookings to authenticated;
grant select on public.profiles to authenticated;

-- A user may edit only presentation fields of their own profile. Role,
-- email and id can be changed only by the service role (server-side).
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.masters enable row level security;
alter table public.services enable row level security;
alter table public.master_services enable row level security;
alter table public.master_schedules enable row level security;
alter table public.bookings enable row level security;
alter table public.slot_blocks enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own_or_owner"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- masters -------------------------------------------------------------------
create policy "masters_public_read_active"
on public.masters for select
to anon, authenticated
using (is_active = true or public.is_owner());

create policy "masters_owner_write"
on public.masters for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- services ------------------------------------------------------------------
create policy "services_public_read_active"
on public.services for select
to anon, authenticated
using (is_active = true or public.is_owner());

create policy "services_owner_write"
on public.services for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- master_services -----------------------------------------------------------
create policy "master_services_public_read"
on public.master_services for select
to anon, authenticated
using (true);

create policy "master_services_owner_write"
on public.master_services for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- master_schedules ----------------------------------------------------------
create policy "master_schedules_public_read"
on public.master_schedules for select
to anon, authenticated
using (
  (
    is_active = true
    and exists (
      select 1 from public.masters m
      where m.id = master_id and m.is_active = true
    )
  )
  or public.is_owner()
);

create policy "master_schedules_owner_write"
on public.master_schedules for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- bookings ------------------------------------------------------------------
create policy "bookings_client_read_own"
on public.bookings for select
to authenticated
using (client_id = auth.uid() or public.is_owner());

create policy "bookings_client_insert_own"
on public.bookings for insert
to authenticated
with check (
  client_id = auth.uid()
  and status = 'pending'
  and start_time > now()
);

create policy "bookings_client_cancel_own"
on public.bookings for update
to authenticated
using (client_id = auth.uid() and status in ('pending', 'confirmed'))
with check (client_id = auth.uid() and status = 'cancelled');

create policy "bookings_owner_write"
on public.bookings for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- slot_blocks ---------------------------------------------------------------
create policy "slot_blocks_owner_read"
on public.slot_blocks for select
to authenticated
using (public.is_owner());

create policy "slot_blocks_owner_write"
on public.slot_blocks for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

commit;
