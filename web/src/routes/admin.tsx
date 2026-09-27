import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";

type Range = "7d" | "30d" | "all";
type LinkRow = { id: string; slug: string; source: string; campaign: string; destination_url: string; active: boolean; clicks: number; unique_visitors: number | null; last_click: string | null };
type Dashboard = { overview: { total_clicks: number; clicks_7d: number; clicks_30d: number; active_links: number; top_source: { name: string; clicks: number } | null; top_campaign: { name: string; clicks: number } | null }; campaigns: LinkRow[]; top_links: { slug: string; source: string; campaign: string; clicks: number }[]; daily_clicks: { date: string; clicks: number }[] };
type FormState = { id?: string; slug: string; source: string; campaign: string; destination_url: string };

const API_URL = "https://mdtvrhfzwmdunawjarvs.supabase.co/functions/v1/marketing-admin";
const SESSION_STORAGE_KEY = "zmetrics_admin_session";
const emptyForm: FormState = { slug: "", source: "", campaign: "", destination_url: "" };

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [sessionToken, setSessionToken] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState("");

  function expireSession(message = "Session expired. Please log in again.") {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionToken("");
    setDashboard(null);
    setError(message);
  }

  async function load(nextSessionToken = sessionToken, nextRange = range) {
    if (!nextSessionToken) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}?range=${nextRange}`, { headers: { authorization: `Bearer ${nextSessionToken}` } });
      if (response.status === 401) { expireSession(); return; }
      if (!response.ok) throw new Error(response.status === 401 ? "Token incorrecto" : "No se pudieron cargar los datos");
      setDashboard(await response.json() as Dashboard);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Error de conexión"); }
    finally { setLoading(false); }
  }

  async function login(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch(API_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "login", password: passwordInput }) });
    const payload = await response.json().catch(() => null) as { error?: string; session_token?: string } | null;
    if (!response.ok || !payload?.session_token) { setError(response.status === 401 ? "Contraseña incorrecta" : "No se pudo iniciar sesión"); return; }
    localStorage.setItem(SESSION_STORAGE_KEY, payload.session_token);
    setSessionToken(payload.session_token);
    setPasswordInput("");
    await load(payload.session_token, range);
  }
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) { setSessionToken(storedSession); void load(storedSession, range); }
  }, []);
  useEffect(() => { if (sessionToken) void load(sessionToken, range); }, [range]);

  async function saveLink(event: FormEvent) {
    event.preventDefault(); setMessage(""); setError("");
    const editing = Boolean(form.id);
    const response = await fetch(API_URL, { method: editing ? "PATCH" : "POST", headers: { authorization: `Bearer ${sessionToken}`, "content-type": "application/json" }, body: JSON.stringify({ action: editing ? "update_link" : "create_link", ...form }) });
    if (response.status === 401) { expireSession(); return; }
    const payload = await response.json().catch(() => null) as { error?: string; link?: { slug?: string } } | null;
    if (!response.ok) { setError(payload?.error ?? "No se pudo guardar el enlace"); return; }
    setForm(emptyForm);
    if (!editing && payload?.link?.slug) await copyLink(payload.link.slug);
    else setMessage("Enlace actualizado");
    await load();
  }

  async function copyLink(slug: string) {
    const shortUrl = `${window.location.origin}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedSlug(slug);
      setMessage(`Enlace copiado: ${shortUrl}`);
      window.setTimeout(() => setCopiedSlug((current) => current === slug ? "" : current), 1800);
    } catch {
      setMessage(`Enlace listo para copiar: ${shortUrl}`);
    }
  }

  async function toggleLink(row: LinkRow) {
    const response = await fetch(API_URL, { method: "PATCH", headers: { authorization: `Bearer ${sessionToken}`, "content-type": "application/json" }, body: JSON.stringify({ action: "set_link_active", id: row.id, active: !row.active }) });
    if (response.status === 401) expireSession(); else if (!response.ok) setError("No se pudo cambiar el estado"); else await load();
  }

  if (!sessionToken || !dashboard) return <main style={styles.login}><section style={styles.loginCard}><div style={styles.eyebrow}>ZMETRICS / GROWTH</div><h1 style={styles.title}>Growth Console</h1><p style={styles.muted}>Panel privado de marketing tracking.</p><form onSubmit={login}><label style={styles.label}>Admin password<input autoFocus type="password" value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} style={styles.input} /></label><button type="submit" style={styles.primary}>Entrar</button></form>{error && <p style={styles.error}>{error}</p>}</section></main>;

  const maxClicks = Math.max(1, ...dashboard.daily_clicks.map((item) => item.clicks));
  return <main style={styles.page}>
    <style>{`.admin-table-row{border-top:1px solid #202632;transition:background .16s ease}.admin-table-row:hover{background:#151a24}.admin-table-row td{padding:14px 12px;white-space:nowrap}.admin-table-row td:first-child{padding-left:0}.admin-table-row td:last-child{padding-right:0}.admin-table th{text-align:left;color:#697487;font-size:10px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;padding:0 12px 10px}.admin-table th:first-child{padding-left:0}.admin-table th:last-child{padding-right:0}.admin-action:hover{color:#fff!important;background:#252d3d!important}.admin-nav-link:hover{color:#f4f7fb!important;background:#1b2230!important}.admin-input:focus{border-color:#6e7cff!important;box-shadow:0 0 0 3px rgba(110,124,255,.16)}@media(max-width:900px){.admin-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.admin-grid{grid-template-columns:1fr!important}.insights{display:none!important}}@media(max-width:620px){.page{padding:24px 14px!important}.header{margin-bottom:20px!important}.admin-nav{align-items:flex-start!important;flex-wrap:wrap;padding-bottom:12px}.navSpacer{display:none}.filters{width:100%;margin-top:8px}.admin-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.card{padding:14px!important}.cardValue{font-size:22px!important}}`}</style>
    <header style={styles.header}><div><div style={styles.brandLine}><span style={styles.brandMark}>Z</span><span>ZMetrics</span><span style={styles.brandDivider}>/</span><span style={styles.eyebrow}>GROWTH CONSOLE</span></div><h1 style={styles.title}>ZMetrics Growth Console</h1><p style={styles.subtitle}>Marketing &amp; acquisition analytics</p></div><button style={styles.secondary} onClick={() => expireSession("You have been logged out.")}>Log out</button></header>
    <nav className="admin-nav" style={styles.nav}><a className="admin-nav-link" href="#overview" style={styles.navLink}>Overview</a><a className="admin-nav-link" href="#links" style={styles.navLink}>Links</a><a className="admin-nav-link" href="#campaigns" style={styles.navLink}>Campaigns</a><div style={styles.navSpacer} /><div style={styles.filters}>{(["7d", "30d", "all"] as Range[]).map((value) => <button key={value} style={range === value ? styles.filterActive : styles.filter} onClick={() => setRange(value)}>{value === "all" ? "Todo" : `Últimos ${value.replace("d", " días")}`}</button>)}</div></nav>
    <section id="overview" className="admin-cards" style={styles.cards}>{[["Total clicks", dashboard.overview.total_clicks], ["Last 7 days", dashboard.overview.clicks_7d], ["Last 30 days", dashboard.overview.clicks_30d], ["Active links", dashboard.overview.active_links]].map(([label, value]) => <div style={styles.card} key={String(label)}><div style={styles.cardLabel}>{label}</div><div style={styles.cardValue}>{value}</div><div style={styles.cardAccent} /></div>)}</section>
    <section style={styles.panel}><div style={styles.panelHeader}><div><h2 style={styles.heading}>Click activity</h2><span style={styles.muted}>Daily clicks · last 30 days</span></div><div style={styles.insights}><span>Top source <b>{dashboard.overview.top_source?.name ?? "N/D"}</b></span><span>Top campaign <b>{dashboard.overview.top_campaign?.name ?? "N/D"}</b></span></div></div><div style={styles.chart}>{dashboard.daily_clicks.map((item) => <div style={styles.barWrap} title={`${item.date}: ${item.clicks}`} key={item.date}><div style={{ ...styles.bar, height: `${Math.max(3, item.clicks / maxClicks * 100)}%` }} /><span>{item.date.slice(8)}</span></div>)}</div></section>
    <section id="links" className="admin-grid" style={styles.grid}><div style={styles.panel}><div style={styles.panelHeader}><div><h2 style={styles.heading}>Top links</h2><span style={styles.muted}>Best performing tracking links</span></div><span style={styles.panelKicker}>TOP 10</span></div>{dashboard.top_links.map((link) => <div style={styles.topRow} key={link.slug}><div><strong>/r/{link.slug}</strong><div style={styles.badgeLine}><span style={styles.badge}>{link.source}</span><span style={styles.badgeMuted}>{link.campaign}</span></div></div><div style={styles.topActions}><strong style={styles.topCount}>{link.clicks}</strong><button className="admin-action" style={styles.linkButton} onClick={() => void copyLink(link.slug)}>{copiedSlug === link.slug ? "Copied" : "Copy"}</button></div></div>)}{dashboard.top_links.length === 0 && <p style={styles.muted}>Sin clicks todavía.</p>}</div><div style={styles.panel}><div style={styles.panelHeader}><div><h2 style={styles.heading}>{form.id ? "Edit link" : "Create link"}</h2><span style={styles.muted}>Configure a new acquisition path</span></div></div><LinkForm form={form} setForm={setForm} onSubmit={saveLink} editing={Boolean(form.id)} /></div></section>
    {message && <p style={styles.success}>{message}</p>}{error && <p style={styles.error}>{error}</p>}
    <section id="campaigns" style={styles.panel}><div style={styles.panelHeader}><div><h2 style={styles.heading}>Campaigns</h2><span style={styles.muted}>All configured marketing links</span></div><span style={styles.panelKicker}>{loading ? "UPDATING…" : `${dashboard.campaigns.length} LINKS`}</span></div><div style={styles.tableScroll}><table className="admin-table" style={styles.table}><thead><tr><th>Slug</th><th>Source</th><th>Campaign</th><th>Clicks</th><th>Visitors</th><th>Last click</th><th>Status</th><th /></tr></thead><tbody>{dashboard.campaigns.map((row) => <tr className="admin-table-row" key={row.id}><td><strong>/r/{row.slug}</strong></td><td><span style={styles.badge}>{row.source}</span></td><td><span style={styles.badgeMuted}>{row.campaign}</span></td><td style={styles.numeric}>{row.clicks}</td><td style={styles.muted}>N/D</td><td style={styles.muted}>{row.last_click ? new Date(row.last_click).toLocaleString() : "N/D"}</td><td><span style={row.active ? styles.active : styles.inactive}>{row.active ? "Active" : "Inactive"}</span></td><td><button className="admin-action" style={styles.linkButton} onClick={() => void copyLink(row.slug)}>{copiedSlug === row.slug ? "Copied" : "Copy"}</button><button className="admin-action" style={styles.linkButton} onClick={() => setForm({ id: row.id, slug: row.slug, source: row.source, campaign: row.campaign, destination_url: row.destination_url })}>Edit</button><button className="admin-action" style={styles.linkButton} onClick={() => void toggleLink(row)}>{row.active ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></section>
  </main>;
}

function LinkForm({ form, setForm, onSubmit, editing }: { form: FormState; setForm: (value: FormState) => void; onSubmit: (event: FormEvent) => void; editing: boolean }) {
  const update = (key: keyof FormState, value: string) => setForm({ ...form, [key]: value });
  return <form onSubmit={onSubmit}><div style={styles.formGrid}>{(["slug", "source", "campaign", "destination_url"] as const).map((key) => <label style={styles.label} key={key}>{key === "destination_url" ? "Destination URL" : key}<input className="admin-input" required value={form[key]} onChange={(event) => update(key, event.target.value)} style={styles.input} placeholder={key === "slug" ? "reddit-btc" : ""} /></label>)}</div><div style={styles.formActions}><button type="submit" style={styles.primary}>{editing ? "Save changes" : "Create link"}</button>{editing && <button type="button" style={styles.secondary} onClick={() => setForm(emptyForm)}>Cancel</button>}</div></form>;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0b0e14", color: "#f4f7fb", padding: "34px clamp(20px, 5vw, 76px)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
  header: { maxWidth: 1280, margin: "0 auto 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  login: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0e14", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
  loginCard: { width: "min(390px, calc(100% - 40px))", padding: 34, border: "1px solid #252c39", borderRadius: 16, background: "#11151e", boxShadow: "0 24px 80px rgba(0,0,0,.34)" },
  brandLine: { display: "flex", alignItems: "center", gap: 9, color: "#f4f7fb", fontSize: 13, fontWeight: 650 }, brandMark: { display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: 7, color: "#0b0e14", background: "#a7b3ff", fontSize: 12, fontWeight: 800 }, brandDivider: { color: "#434b5a" },
  eyebrow: { color: "#8993a5", fontSize: 10, fontWeight: 700, letterSpacing: ".14em" }, title: { fontSize: 30, letterSpacing: "-.045em", margin: "18px 0 5px", fontWeight: 650 }, subtitle: { color: "#8993a5", fontSize: 14, margin: 0 }, muted: { color: "#8993a5", fontSize: 12 }, nav: { maxWidth: 1280, margin: "0 auto 22px", minHeight: 40, display: "flex", alignItems: "center", gap: 3, borderBottom: "1px solid #202632" }, navLink: { color: "#8993a5", textDecoration: "none", borderRadius: 7, padding: "8px 11px", fontSize: 13 }, navSpacer: { flex: 1 }, filters: { display: "flex", gap: 5 }, filter: { border: "1px solid #29313f", background: "#11151e", borderRadius: 7, padding: "7px 10px", color: "#8993a5", cursor: "pointer", fontSize: 12 }, filterActive: { border: "1px solid #5968dc", background: "#252d57", color: "#dfe3ff", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontSize: 12 }, cards: { maxWidth: 1280, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }, card: { position: "relative", overflow: "hidden", background: "#11151e", border: "1px solid #252c39", borderRadius: 11, padding: 18 }, cardLabel: { color: "#8993a5", fontSize: 12, marginBottom: 13 }, cardValue: { fontSize: 27, fontWeight: 650, letterSpacing: "-.04em" }, cardAccent: { position: "absolute", top: 0, left: 18, right: 18, height: 2, background: "linear-gradient(90deg, #6876e8, transparent)" }, panel: { background: "#11151e", border: "1px solid #252c39", borderRadius: 11, padding: 21, marginBottom: 18, boxShadow: "0 12px 30px rgba(0,0,0,.08)" }, panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }, heading: { fontSize: 15, margin: "0 0 5px", letterSpacing: "-.015em", fontWeight: 620 }, panelKicker: { color: "#6876e8", fontSize: 10, fontWeight: 700, letterSpacing: ".12em" }, insights: { display: "flex", gap: 14, color: "#8993a5", fontSize: 11 }, chart: { height: 165, display: "flex", alignItems: "end", gap: 4, borderBottom: "1px solid #252c39", paddingTop: 18, marginTop: 20 }, barWrap: { height: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 7, color: "#596272", fontSize: 9 }, bar: { width: "100%", maxWidth: 18, minHeight: 3, borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg, #8b98ff, #5968dc)" }, grid: { maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, .8fr)", gap: 18 }, topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #202632" }, topActions: { display: "flex", alignItems: "center", gap: 8 }, badgeLine: { display: "flex", alignItems: "center", gap: 6, marginTop: 7 }, badge: { display: "inline-flex", alignItems: "center", border: "1px solid #34405e", background: "#1b2340", color: "#aeb8ff", borderRadius: 5, padding: "3px 7px", fontSize: 10, fontWeight: 650 }, badgeMuted: { display: "inline-flex", alignItems: "center", border: "1px solid #303846", background: "#1a1f29", color: "#aab2c0", borderRadius: 5, padding: "3px 7px", fontSize: 10 }, topCount: { color: "#dfe3ff", fontSize: 14 }, label: { display: "grid", gap: 7, color: "#aab2c0", fontSize: 11 }, input: { width: "100%", boxSizing: "border-box", border: "1px solid #303846", borderRadius: 7, padding: "10px 11px", background: "#0d1118", color: "#f4f7fb", font: "inherit", fontSize: 13, outline: "none" }, formGrid: { display: "grid", gap: 11 }, formActions: { display: "flex", gap: 8, marginTop: 16 }, primary: { border: 0, borderRadius: 7, background: "#7180f2", color: "#0b0e14", padding: "10px 14px", cursor: "pointer", fontWeight: 700 }, secondary: { border: "1px solid #303846", borderRadius: 7, background: "#151a23", color: "#c7cdd8", padding: "8px 12px", cursor: "pointer" }, success: { maxWidth: 1280, margin: "0 auto 15px", color: "#58c995", fontSize: 12 }, error: { color: "#ff8d8d", fontSize: 12, marginTop: 12 }, tableScroll: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, numeric: { color: "#f4f7fb", fontWeight: 650 }, active: { color: "#72d8a5", background: "#163628", border: "1px solid #245d44", padding: "4px 8px", borderRadius: 99, fontSize: 10, fontWeight: 650 }, inactive: { color: "#9ca5b4", background: "#202632", border: "1px solid #303846", padding: "4px 8px", borderRadius: 99, fontSize: 10 }, linkButton: { border: 0, background: "transparent", color: "#8998ff", cursor: "pointer", padding: "6px 7px", borderRadius: 5, fontSize: 11 },
};
