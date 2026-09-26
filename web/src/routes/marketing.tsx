import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Summary = { slug: string; source: string; campaign: string; clicks_7d: number; clicks_30d: number; total_clicks: number; active: boolean };

export const Route = createFileRoute("/marketing")({ component: MarketingDashboard });

function MarketingDashboard() {
  const [rows, setRows] = useState<Summary[]>([]);
  const [error, setError] = useState("Loading…");
  useEffect(() => {
    const token = window.prompt("Marketing admin token");
    if (!token) return setError("Access cancelled");
    fetch("https://mdtvrhfzwmdunawjarvs.supabase.co/functions/v1/marketing-admin", { headers: { authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unauthorized")))
      .then((data: Summary[]) => { setRows(data); setError(""); })
      .catch(() => setError("Unable to load marketing data"));
  }, []);
  return <main style={{ maxWidth: 960, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}><h1>Marketing links</h1>{error && <p>{error}</p>}<table style={{ width: "100%", textAlign: "left" }}><thead><tr><th>Link</th><th>Source</th><th>Campaign</th><th>7 days</th><th>30 days</th><th>Total</th></tr></thead><tbody>{rows.map((row) => <tr key={row.slug}><td>/{row.slug}</td><td>{row.source}</td><td>{row.campaign}</td><td>{row.clicks_7d}</td><td>{row.clicks_30d}</td><td>{row.total_clicks}</td></tr>)}</tbody></table></main>;
}
