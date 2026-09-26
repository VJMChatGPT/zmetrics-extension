import { createClient } from "npm:@supabase/supabase-js@2";
const adminToken = Deno.env.get("MARKETING_ADMIN_TOKEN");
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(async (request) => {
  if (!adminToken || request.headers.get("authorization") !== `Bearer ${adminToken}`) return new Response("Unauthorized", { status: 401 });
  const { data, error } = await supabase.from("marketing_link_summary").select("*").order("clicks_30d", { ascending: false });
  if (error) return Response.json({ error: "query_failed" }, { status: 500 });
  return Response.json(data);
});
