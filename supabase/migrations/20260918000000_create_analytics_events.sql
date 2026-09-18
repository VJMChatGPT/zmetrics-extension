create table if not exists public.analytics_events (
  event_id uuid primary key,
  installation_id uuid not null,
  session_id uuid,
  event_name text not null check (event_name in (
    'install',
    'update',
    'session_start',
    'extension_open',
    'price_load',
    'watchlist_change',
    'currency_change',
    'client_error'
  )),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  extension_version text,
  surface text,
  trigger text,
  properties jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at);

create index if not exists analytics_events_event_name_occurred_at_idx
  on public.analytics_events (event_name, occurred_at);

create index if not exists analytics_events_installation_occurred_at_idx
  on public.analytics_events (installation_id, occurred_at);

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from anon, authenticated;
