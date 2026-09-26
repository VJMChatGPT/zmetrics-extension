import { createClient } from "npm:@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(async (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const slug = new URL(request.url).searchParams.get("slug")?.toLowerCase();
  if (!slug || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(slug)) return new Response("Not found", { status: 404 });
  const { data: link, error } = await supabase.from("marketing_links").select("id,destination_url").eq("slug", slug).eq("active", true).maybeSingle();
  if (error || !link) return new Response("Not found", { status: 404 });
  await supabase.from("marketing_clicks").insert({ link_id: link.id, referrer: request.headers.get("referer")?.slice(0, 2048) ?? null });
  return new Response(null, { status: 302, headers: { location: link.destination_url, "cache-control": "no-store" } });
});
