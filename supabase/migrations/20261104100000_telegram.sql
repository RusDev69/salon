-- ============================================================================
-- Telegram notification subscribers
-- Anyone who sends /start to the bot is stored here and receives booking
-- notifications. /stop deactivates the subscription.
-- ============================================================================

begin;

create table public.telegram_subscribers (
  id         uuid primary key default gen_random_uuid(),
  chat_id    text not null unique,
  username   text,
  first_name text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index telegram_subscribers_active_idx
  on public.telegram_subscribers (is_active);

create trigger telegram_subscribers_touch_updated_at
before update on public.telegram_subscribers
for each row execute function public.touch_updated_at();

alter table public.telegram_subscribers enable row level security;

-- The Next.js server uses a trusted Prisma connection / bot webhook. Only the
-- owner may inspect subscribers through the authenticated Supabase client.
create policy "telegram_subscribers_owner_read"
on public.telegram_subscribers for select
to authenticated
using (public.is_owner());

grant select on public.telegram_subscribers to authenticated;

commit;
