import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";

type Range = "7d" | "30d" | "all";
type LinkRow = { id: string; slug: string; source: string; campaign: string; destination_url: string; active: boolean; clicks: number; unique_visitors: number | null; last_click: string | null };
type Dashboard = { overview: { total_clicks: number; clicks_7d: number; clicks_30d: number; active_links: number; top_source: { name: string; clicks: number } | null; top_campaign: { name: string; clicks: number } | null }; campaigns: LinkRow[]; top_links: { slug: string; source: string; campaign: string; clicks: number }[]; daily_clicks: { date: string; clicks: number }[] };
type FormState = { id?: string; slug: string; source: string; campaign: string; destination_url: string };

const API_URL = "https://mdtvrhfzwmdunawjarvs.supabase.co/functions/v1/marketing-admin";
const emptyForm: FormState = { slug: "", source: "", campaign: "", destination_url: "" };

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(nextToken = token, nextRange = range) {
    if (!nextToken) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}?range=${nextRange}`, { headers: { authorization: `Bearer ${nextToken}` } });
      if (!response.ok) throw new Error(response.status === 401 ? "Token incorrecto" : "No se pudieron cargar los datos");
      setDashboard(await response.json() as Dashboard);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Error de conexión"); }
    finally { setLoading(false); }
  }

  function login(event: FormEvent) { event.preventDefault(); setToken(tokenInput); void load(tokenInput, range); }
  useEffect(() => { if (token) void load(token, range); }, [range]);

  async function saveLink(event: FormEvent) {
    event.preventDefault(); setMessage(""); setError("");
    const editing = Boolean(form.id);
    const response = await fetch(API_URL, { method: editing ? "PATCH" : "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ action: editing ? "update_link" : "create_link", ...form }) });
    if (!response.ok) { const payload = await response.json().catch(() => null) as { error?: string } | null; setError(payload?.error ?? "No se pudo guardar el enlace"); return; }
    setForm(emptyForm); setMessage(editing ? "Enlace actualizado" : "Enlace creado"); await load();
  }

  async function toggleLink(row: LinkRow) {
    const response = await fetch(API_URL, { method: "PATCH", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ action: "set_link_active", id: row.id, active: !row.active }) });
    if (!response.ok) setError("No se pudo cambiar el estado"); else await load();
  }

  if (!token || !dashboard) return <main style={styles.login}><section style={styles.loginCard}><div style={styles.eyebrow}>ZMETRICS / GROWTH</div><h1 style={styles.title}>Growth Console</h1><p style={styles.muted}>Panel privado de marketing tracking.</p><form onSubmit={login}><label style={styles.label}>Admin token<input autoFocus type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} style={styles.input} /></label><button type="submit" style={styles.primary}>Entrar</button></form>{error && <p style={styles.error}>{error}</p>}</section></main>;

  const maxClicks = Math.max(1, ...dashboard.daily_clicks.map((item) => item.clicks));
  return <main style={styles.page}><header style={styles.header}><div><div style={styles.eyebrow}>ZMETRICS / GROWTH</div><h1 style={styles.title}>Growth Console</h1></div><button style={styles.secondary} onClick={() => { setToken(""); setDashboard(null); }}>Salir</button></header>
    <div style={styles.filters}>{(["7d", "30d", "all"] as Range[]).map((value) => <button key={value} style={range === value ? styles.filterActive : styles.filter} onClick={() => setRange(value)}>{value === "all" ? "Todo" : `Últimos ${value.replace("d", " días")}`}</button>)}</div>
    <section style={styles.cards}>{[["Clicks", dashboard.overview.total_clicks], ["Últimos 7 días", dashboard.overview.clicks_7d], ["Últimos 30 días", dashboard.overview.clicks_30d], ["Enlaces activos", dashboard.overview.active_links], ["Top source", dashboard.overview.top_source?.name ?? "N/D"], ["Top campaign", dashboard.overview.top_campaign?.name ?? "N/D"]].map(([label, value]) => <div style={styles.card} key={String(label)}><div style={styles.cardLabel}>{label}</div><div style={styles.cardValue}>{value}</div></div>)}</section>
    <section style={styles.panel}><div style={styles.panelHeader}><h2 style={styles.heading}>Clicks diarios</h2><span style={styles.muted}>últimos 30 días</span></div><div style={styles.chart}>{dashboard.daily_clicks.map((item) => <div style={styles.barWrap} title={`${item.date}: ${item.clicks}`} key={item.date}><div style={{ ...styles.bar, height: `${Math.max(3, item.clicks / maxClicks * 100)}%` }} /><span>{item.date.slice(8)}</span></div>)}</div></section>
    <section style={styles.grid}><div style={styles.panel}><h2 style={styles.heading}>Top links</h2>{dashboard.top_links.map((link) => <div style={styles.topRow} key={link.slug}><div><strong>/{link.slug}</strong><div style={styles.muted}>{link.source} · {link.campaign}</div></div><strong>{link.clicks}</strong></div>)}{dashboard.top_links.length === 0 && <p style={styles.muted}>Sin clicks todavía.</p>}</div><div style={styles.panel}><h2 style={styles.heading}>{form.id ? "Editar enlace" : "Nuevo enlace"}</h2><LinkForm form={form} setForm={setForm} onSubmit={saveLink} editing={Boolean(form.id)} /></div></section>
    {message && <p style={styles.success}>{message}</p>}{error && <p style={styles.error}>{error}</p>}
    <section style={styles.panel}><div style={styles.panelHeader}><h2 style={styles.heading}>Campañas</h2><span style={styles.muted}>{loading ? "Actualizando…" : `${dashboard.campaigns.length} enlaces`}</span></div><div style={styles.tableScroll}><table style={styles.table}><thead><tr><th>Slug</th><th>Source</th><th>Campaign</th><th>Clicks</th><th>Visitantes</th><th>Último click</th><th>Estado</th><th /></tr></thead><tbody>{dashboard.campaigns.map((row) => <tr key={row.id}><td>/{row.slug}</td><td>{row.source}</td><td>{row.campaign}</td><td>{row.clicks}</td><td>N/D</td><td>{row.last_click ? new Date(row.last_click).toLocaleString() : "N/D"}</td><td><span style={row.active ? styles.active : styles.inactive}>{row.active ? "Activo" : "Inactivo"}</span></td><td><button style={styles.linkButton} onClick={() => setForm({ id: row.id, slug: row.slug, source: row.source, campaign: row.campaign, destination_url: row.destination_url })}>Editar</button><button style={styles.linkButton} onClick={() => void toggleLink(row)}>{row.active ? "Desactivar" : "Activar"}</button></td></tr>)}</tbody></table></div></section>
  </main>;
}

function LinkForm({ form, setForm, onSubmit, editing }: { form: FormState; setForm: (value: FormState) => void; onSubmit: (event: FormEvent) => void; editing: boolean }) {
  const update = (key: keyof FormState, value: string) => setForm({ ...form, [key]: value });
  return <form onSubmit={onSubmit}><div style={styles.formGrid}>{(["slug", "source", "campaign", "destination_url"] as const).map((key) => <label style={styles.label} key={key}>{key === "destination_url" ? "Destination URL" : key}<input required value={form[key]} onChange={(event) => update(key, event.target.value)} style={styles.input} placeholder={key === "slug" ? "reddit-btc" : ""} /></label>)}</div><div style={styles.formActions}><button type="submit" style={styles.primary}>{editing ? "Guardar cambios" : "Crear enlace"}</button>{editing && <button type="button" style={styles.secondary} onClick={() => setForm(emptyForm)}>Cancelar</button>}</div></form>;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f8fa", color: "#17181a", padding: "32px clamp(20px, 5vw, 72px)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
  header: { maxWidth: 1280, margin: "0 auto 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  login: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f8fa", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
  loginCard: { width: "min(380px, calc(100% - 40px))", padding: 32, border: "1px solid #e4e6e9", borderRadius: 14, background: "white", boxShadow: "0 12px 40px rgba(20, 24, 32, .06)" },
  eyebrow: { color: "#6b6f76", fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }, title: { fontSize: 28, letterSpacing: "-.04em", margin: "8px 0 4px" }, muted: { color: "#737780", fontSize: 13 }, filters: { maxWidth: 1280, margin: "0 auto 20px", display: "flex", gap: 6 }, filter: { border: "1px solid #e1e3e7", background: "white", borderRadius: 7, padding: "7px 11px", color: "#656970", cursor: "pointer" }, filterActive: { border: "1px solid #17181a", background: "#17181a", color: "white", borderRadius: 7, padding: "7px 11px", cursor: "pointer" }, cards: { maxWidth: 1280, margin: "0 auto 20px", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10 }, card: { background: "white", border: "1px solid #e4e6e9", borderRadius: 10, padding: 16 }, cardLabel: { color: "#737780", fontSize: 12, marginBottom: 10 }, cardValue: { fontSize: 23, fontWeight: 650, letterSpacing: "-.03em" }, panel: { background: "white", border: "1px solid #e4e6e9", borderRadius: 10, padding: 20, marginBottom: 20 }, panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, heading: { fontSize: 15, margin: "0 0 14px", letterSpacing: "-.015em" }, chart: { height: 150, display: "flex", alignItems: "end", gap: 4, borderBottom: "1px solid #eceef0", paddingTop: 12 }, barWrap: { height: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 6, color: "#a0a4ab", fontSize: 9 }, bar: { width: "100%", maxWidth: 18, minHeight: 3, borderRadius: "3px 3px 0 0", background: "#5e6ad2" }, grid: { maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, .8fr)", gap: 20 }, topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f0f1f3" }, label: { display: "grid", gap: 6, color: "#60646c", fontSize: 12 }, input: { width: "100%", boxSizing: "border-box", border: "1px solid #dfe1e5", borderRadius: 7, padding: "9px 10px", font: "inherit", fontSize: 13, outline: "none" }, formGrid: { display: "grid", gap: 10 }, formActions: { display: "flex", gap: 8, marginTop: 14 }, primary: { border: 0, borderRadius: 7, background: "#17181a", color: "white", padding: "9px 13px", cursor: "pointer", fontWeight: 600 }, secondary: { border: "1px solid #dfe1e5", borderRadius: 7, background: "white", color: "#4d5158", padding: "8px 12px", cursor: "pointer" }, success: { maxWidth: 1280, margin: "0 auto 16px", color: "#16803c", fontSize: 13 }, error: { color: "#c0392b", fontSize: 13, marginTop: 12 }, tableScroll: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse", fontSize: 13 }, active: { color: "#16803c", background: "#e8f7ee", padding: "3px 7px", borderRadius: 99, fontSize: 11 }, inactive: { color: "#777b82", background: "#f0f1f3", padding: "3px 7px", borderRadius: 99, fontSize: 11 }, linkButton: { border: 0, background: "transparent", color: "#5e6ad2", cursor: "pointer", padding: "4px 6px", fontSize: 12 },
};
