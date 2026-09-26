import { createClient } from "npm:@supabase/supabase-js@2";

const adminToken = Deno.env.get("MARKETING_ADMIN_TOKEN");
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
const origin = "https://zmetrics.net";
const slugPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
type Link = { id: string; slug: string; source: string; campaign: string; destination_url: string; active: boolean; created_at: string };
type Click = { link_id: string; created_at: string; visitor_id: string | null };

function headers(request: Request) {
  const result = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (request.headers.get("origin") === origin) {
    result.set("access-control-allow-origin", origin);
    result.set("access-control-allow-headers", "authorization, content-type");
    result.set("access-control-allow-methods", "GET, POST, PATCH, OPTIONS");
    result.set("vary", "Origin");
  }
  return result;
}
function json(request: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: headers(request) }); }
function error(request: Request, code: string, status: number) { return json(request, { error: code }, status); }
function text(value: unknown, max: number): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= max; }
function url(value: unknown): value is string { if (!text(value, 2048)) return false; try { const parsed = new URL(value); return parsed.protocol === "http:" || parsed.protocol === "https:"; } catch { return false; } }
function start(range: string): number | null { return range === "all" ? null : Date.now() - (range === "7d" ? 7 : 30) * 86400000; }
function top(values: Map<string, number>) { const item = [...values.entries()].sort((a, b) => b[1] - a[1])[0]; return item ? { name: item[0], clicks: item[1] } : null; }

async function dashboard(request: Request) {
  const requested = new URL(request.url).searchParams.get("range") ?? "30d";
  const range = ["7d", "30d", "all"].includes(requested) ? requested : "30d";
  const [linksResult, clicksResult] = await Promise.all([
    supabase.from("marketing_links").select("id,slug,source,campaign,destination_url,active,created_at").order("created_at", { ascending: false }),
    supabase.from("marketing_clicks").select("link_id,created_at,visitor_id").order("created_at", { ascending: false }),
  ]);
  if (linksResult.error || clicksResult.error) return error(request, "query_failed", 500);
  const links = (linksResult.data ?? []) as Link[];
  const clicks = (clicksResult.data ?? []) as Click[];
  const byId = new Map(links.map((link) => [link.id, link]));
  const rangeStart = start(range);
  const selected = clicks.filter((click) => rangeStart === null || Date.parse(click.created_at) >= rangeStart);
  const counts = new Map<string, number>(), sources = new Map<string, number>(), campaigns = new Map<string, number>(), last = new Map<string, string>();
  for (const click of selected) {
    counts.set(click.link_id, (counts.get(click.link_id) ?? 0) + 1);
    const link = byId.get(click.link_id);
    if (link) { sources.set(link.source, (sources.get(link.source) ?? 0) + 1); campaigns.set(link.campaign, (campaigns.get(link.campaign) ?? 0) + 1); }
    if (!last.has(click.link_id)) last.set(click.link_id, click.created_at);
  }
  const graphStart = Date.now() - 30 * 86400000;
  const daily = new Map<string, number>();
  for (const click of clicks) if (Date.parse(click.created_at) >= graphStart) { const day = click.created_at.slice(0, 10); daily.set(day, (daily.get(day) ?? 0) + 1); }
  const dailyClicks = Array.from({ length: 30 }, (_, index) => { const date = new Date(Date.now() - (29 - index) * 86400000).toISOString().slice(0, 10); return { date, clicks: daily.get(date) ?? 0 }; });
  const rows = links.map((link) => ({ ...link, clicks: counts.get(link.id) ?? 0, unique_visitors: null, last_click: last.get(link.id) ?? null }));
  return json(request, {
    range,
    overview: { total_clicks: selected.length, clicks_7d: clicks.filter((click) => Date.parse(click.created_at) >= Date.now() - 7 * 86400000).length, clicks_30d: clicks.filter((click) => Date.parse(click.created_at) >= graphStart).length, active_links: links.filter((link) => link.active).length, top_source: top(sources), top_campaign: top(campaigns) },
    campaigns: rows,
    top_links: [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 10).map((row) => ({ slug: row.slug, source: row.source, campaign: row.campaign, clicks: row.clicks })),
    daily_clicks: dailyClicks,
  });
}

async function createLink(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  if (!slugPattern.test(String(body.slug ?? "")) || !text(body.source, 100) || !text(body.campaign, 150) || !url(body.destination_url)) return error(request, "invalid_link", 400);
  const { data, error: insertError } = await supabase.from("marketing_links").insert({ slug: body.slug, source: body.source, campaign: body.campaign, destination_url: body.destination_url }).select("*").single();
  if (insertError) return error(request, insertError.code === "23505" ? "slug_already_exists" : "create_failed", insertError.code === "23505" ? 409 : 500);
  return json(request, { link: data }, 201);
}

async function updateLink(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  if (!text(body.id, 100)) return error(request, "invalid_id", 400);
  const updates: Record<string, unknown> = {};
  if (body.slug !== undefined) { if (!slugPattern.test(String(body.slug))) return error(request, "invalid_slug", 400); updates.slug = body.slug; }
  if (body.source !== undefined) { if (!text(body.source, 100)) return error(request, "invalid_source", 400); updates.source = body.source; }
  if (body.campaign !== undefined) { if (!text(body.campaign, 150)) return error(request, "invalid_campaign", 400); updates.campaign = body.campaign; }
  if (body.destination_url !== undefined) { if (!url(body.destination_url)) return error(request, "invalid_destination", 400); updates.destination_url = body.destination_url; }
  if (body.active !== undefined) { if (typeof body.active !== "boolean") return error(request, "invalid_active", 400); updates.active = body.active; }
  if (!Object.keys(updates).length) return error(request, "no_updates", 400);
  const { data, error: updateError } = await supabase.from("marketing_links").update(updates).eq("id", body.id).select("*").single();
  if (updateError) return error(request, updateError.code === "23505" ? "slug_already_exists" : "update_failed", updateError.code === "23505" ? 409 : 500);
  return json(request, { link: data });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(request) });
  if (!adminToken || request.headers.get("authorization") !== `Bearer ${adminToken}`) return error(request, "unauthorized", 401);
  try { if (request.method === "GET") return await dashboard(request); if (request.method === "POST") return await createLink(request); if (request.method === "PATCH") return await updateLink(request); return error(request, "method_not_allowed", 405); }
  catch (caught) { console.error(caught instanceof Error ? caught.message : "admin_request_failed"); return error(request, "invalid_request", 400); }
});
