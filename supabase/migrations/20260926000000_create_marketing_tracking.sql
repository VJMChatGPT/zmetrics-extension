create table if not exists public.marketing_links (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  source text not null, campaign text not null, destination_url text not null check (destination_url ~ '^https?://'),
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.marketing_clicks (
  id bigint generated always as identity primary key, link_id uuid not null references public.marketing_links(id) on delete cascade,
  created_at timestamptz not null default now(), referrer text, visitor_id text
);
create index if not exists marketing_clicks_link_created_idx on public.marketing_clicks (link_id, created_at desc);
create index if not exists marketing_clicks_created_idx on public.marketing_clicks (created_at desc);
alter table public.marketing_links enable row level security;
alter table public.marketing_clicks enable row level security;
revoke all on table public.marketing_links, public.marketing_clicks from anon, authenticated;
grant all on table public.marketing_links, public.marketing_clicks to service_role;
create or replace view public.marketing_link_summary with (security_invoker = true) as
select l.id, l.slug, l.source, l.campaign, l.destination_url, l.active, l.created_at,
 count(c.id)::bigint as total_clicks,
 count(c.id) filter (where c.created_at >= now() - interval '7 days')::bigint as clicks_7d,
 count(c.id) filter (where c.created_at >= now() - interval '30 days')::bigint as clicks_30d
from public.marketing_links l left join public.marketing_clicks c on c.link_id = l.id group by l.id;
revoke all on public.marketing_link_summary from anon, authenticated;
grant select on public.marketing_link_summary to service_role;
