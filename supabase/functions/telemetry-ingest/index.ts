import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_EVENTS_PER_BATCH = 20;
const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VERSION_PATTERN = /^[0-9A-Za-z._-]{1,32}$/;
const EVENT_NAMES = new Set([
  "install",
  "update",
  "session_start",
  "extension_open",
  "price_load",
  "watchlist_change",
  "currency_change",
  "client_error"
]);
const PROPERTY_KEYS: Record<string, string[]> = {
  install: [],
  update: ["previous_version"],
  session_start: [],
  extension_open: ["surface", "trigger"],
  price_load: ["status", "provider"],
  watchlist_change: ["action", "total_assets"],
  currency_change: ["currency"],
  client_error: ["error_code", "component"]
};

function corsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (origin === "https://zmetrics.net" || /^chrome-extension:\/\/[a-p]{32}$/.test(origin || "")) return origin;
  return null;
}

function responseBody(body: Record<string, unknown>, status: number, request: Request): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  const origin = corsOrigin(request);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "content-type");
    headers.set("Vary", "Origin");
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isVersion(value: unknown): value is string {
  return typeof value === "string" && VERSION_PATTERN.test(value);
}

function validProperties(eventName: string, properties: unknown): properties is Record<string, unknown> {
  if (!isPlainObject(properties)) return false;
  const allowed = PROPERTY_KEYS[eventName];
  if (Object.keys(properties).some((key) => !allowed.includes(key))) return false;

  if (eventName === "update") return isVersion(properties.previous_version);
  if (eventName === "extension_open") {
    return ["popup", "floating_window"].includes(String(properties.surface)) && ["toolbar", "shortcut", "other"].includes(String(properties.trigger));
  }
  if (eventName === "price_load") return ["success", "error"].includes(String(properties.status)) && properties.provider === "coingecko";
  if (eventName === "watchlist_change") return ["add", "remove"].includes(String(properties.action)) && Number.isInteger(properties.total_assets) && Number(properties.total_assets) >= 0 && Number(properties.total_assets) <= 1000;
  if (eventName === "currency_change") return ["USD", "EUR"].includes(String(properties.currency));
  if (eventName === "client_error") return typeof properties.error_code === "string" && /^[A-Z0-9_]{1,64}$/.test(properties.error_code) && typeof properties.component === "string" && /^[a-z0-9_-]{1,32}$/.test(properties.component);
  return Object.keys(properties).length === 0;
}

function validateEvent(value: unknown): Record<string, unknown> | null {
  if (!isPlainObject(value)) return null;
  const allowedKeys = ["event_id", "installation_id", "session_id", "event_name", "occurred_at", "extension_version", "properties"];
  if (Object.keys(value).some((key) => !allowedKeys.includes(key))) return null;
  if (!isUuid(value.event_id) || !isUuid(value.installation_id) || (value.session_id !== null && !isUuid(value.session_id))) return null;
  if (typeof value.event_name !== "string" || !EVENT_NAMES.has(value.event_name)) return null;
  if (!isVersion(value.extension_version)) return null;
  if (typeof value.occurred_at !== "string") return null;
  const occurredAt = Date.parse(value.occurred_at);
  if (!Number.isFinite(occurredAt) || occurredAt < Date.now() - MAX_EVENT_AGE_MS || occurredAt > Date.now() + MAX_FUTURE_SKEW_MS) return null;
  if (!validProperties(value.event_name, value.properties)) return null;

  return value;
}

function ga4ClientId(installationId: string): string {
  const hex = installationId.replaceAll("-", "");
  const first = Number(BigInt(`0x${hex.slice(0, 8)}`) % 4294967296n);
  const second = Number(BigInt(`0x${hex.slice(8, 16)}`) % 4294967296n);
  return `${first}.${second}`;
}

function ga4SessionId(sessionId: string | null): number {
  if (!sessionId) return 1;
  const hex = sessionId.replaceAll("-", "").slice(0, 12);
  return Number(BigInt(`0x${hex}`) % 9007199254740991n) || 1;
}

async function forwardToGa4(events: Record<string, unknown>[]): Promise<void> {
  const measurementId = Deno.env.get("GA4_MEASUREMENT_ID");
  const apiSecret = Deno.env.get("GA4_API_SECRET");
  if (!measurementId || !apiSecret) {
    console.warn("GA4 secrets are not configured; Supabase remains the source of truth.");
    return;
  }

  const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: ga4ClientId(events[0].installation_id as string),
      events: events.map((event) => {
        const params = {
          ...(event.properties as Record<string, unknown>),
          extension_version: event.extension_version,
          zmetrics_event_id: event.event_id,
          zmetrics_session_id: event.session_id,
          session_id: ga4SessionId(event.session_id as string | null),
          engagement_time_msec: 1
        };
        return {
          name: event.event_name === "session_start" ? "zmetrics_session_start" : event.event_name,
          params
        };
      })
    })
  });

  if (!response.ok) throw new Error(`GA4 forwarding failed with HTTP ${response.status}`);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return responseBody({ ok: true }, 204, request);
  }
  if (request.method !== "POST") return responseBody({ error: "method_not_allowed" }, 405, request);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return responseBody({ error: "content_type_required" }, 415, request);

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return responseBody({ error: "payload_too_large" }, 413, request);

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return responseBody({ error: "payload_too_large" }, 413, request);

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch (_) {
    return responseBody({ error: "invalid_json" }, 400, request);
  }
  if (!isPlainObject(payload) || Object.keys(payload).some((key) => key !== "events") || !Array.isArray(payload.events) || payload.events.length === 0 || payload.events.length > MAX_EVENTS_PER_BATCH) {
    return responseBody({ error: "invalid_batch" }, 400, request);
  }

  const events = payload.events.map(validateEvent);
  if (events.some((event) => event === null)) return responseBody({ error: "invalid_event" }, 400, request);
  const validEvents = events as Record<string, unknown>[];
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return responseBody({ error: "server_not_configured" }, 500, request);

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows = validEvents.map((event) => {
    const properties = event.properties as Record<string, unknown>;
    return {
      event_id: event.event_id,
      installation_id: event.installation_id,
      session_id: event.session_id,
      event_name: event.event_name,
      occurred_at: event.occurred_at,
      extension_version: event.extension_version,
      surface: properties.surface || null,
      trigger: properties.trigger || null,
      properties
    };
  });

  const { data: insertedRows, error } = await supabase
    .from("analytics_events")
    .upsert(rows, { onConflict: "event_id", ignoreDuplicates: true })
    .select("event_id");
  if (error) {
    console.error("Telemetry insert failed", error.code);
    return responseBody({ error: "ingest_failed" }, 500, request);
  }

  const insertedIds = new Set((insertedRows || []).map((row) => row.event_id));
  const newlyInsertedEvents = validEvents.filter((event) => insertedIds.has(event.event_id));
  if (newlyInsertedEvents.length > 0) {
    const byInstallation = new Map<string, Record<string, unknown>[]>();
    for (const event of newlyInsertedEvents) {
      const installationId = event.installation_id as string;
      const group = byInstallation.get(installationId) || [];
      group.push(event);
      byInstallation.set(installationId, group);
    }
    await Promise.all([...byInstallation.values()].map(async (eventsForInstallation) => {
      try {
        await forwardToGa4(eventsForInstallation);
      } catch (error) {
        console.error("Telemetry GA4 forwarding failed", error instanceof Error ? error.name : "unknown_error");
      }
    }));
  }

  return responseBody({ accepted: newlyInsertedEvents.length }, 202, request);
});
