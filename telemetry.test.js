import test from "node:test";
import assert from "node:assert/strict";
import {
  EVENT_PROPERTY_KEYS,
  MAX_QUEUE_SIZE,
  SESSION_TIMEOUT_MS,
  TELEMETRY_STORAGE_KEYS,
  createTelemetryEvent,
  createTelemetryManager,
  getTelemetrySurface,
  isUuid,
  sanitizeProperties
} from "./telemetry.js";

const UUIDS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
  "55555555-5555-4555-8555-555555555555",
  "66666666-6666-4666-8666-666666666666",
  "77777777-7777-4777-8777-777777777777"
];

function makeChrome() {
  const values = { local: {}, session: {} };
  const storage = (area) => ({
    get(defaults, callback) {
      callback({ ...defaults, ...values[area] });
    },
    set(next, callback) {
      Object.assign(values[area], next);
      callback?.();
    }
  });
  return {
    values,
    runtime: {
      lastError: null,
      getManifest: () => ({ version: "1.4.4" })
    },
    storage: { local: storage("local"), session: storage("session") }
  };
}

function uuidSequence() {
  let index = 0;
  return () => UUIDS[index++] || `${String(index).padStart(8, "0")}-0000-4000-8000-000000000000`;
}

function response(ok) {
  return { ok, status: ok ? 202 : 503 };
}

test("installation_id is generated once and reused", async () => {
  const chromeApi = makeChrome();
  const manager = createTelemetryManager({ chromeApi, fetchImpl: async () => response(true), randomUUID: uuidSequence() });

  await manager.track("price_load", { status: "success", provider: "coingecko" });
  const first = chromeApi.values.local[TELEMETRY_STORAGE_KEYS.installationId];
  await manager.track("price_load", { status: "success", provider: "coingecko" });

  assert.equal(chromeApi.values.local[TELEMETRY_STORAGE_KEYS.installationId], first);
  assert.ok(isUuid(first));
});

test("concurrent tracking keeps one installation and session identity", async () => {
  const chromeApi = makeChrome();
  const manager = createTelemetryManager({
    chromeApi,
    fetchImpl: async () => ({ ok: true, status: 202 }),
    randomUUID: uuidSequence()
  });

  const results = await Promise.all([
    manager.track("price_load", { status: "success", provider: "coingecko" }),
    manager.track("currency_change", { currency: "EUR" })
  ]);
  const installationIds = results.flatMap((result) => result.events).map((event) => event.installation_id);
  const sessionIds = results.flatMap((result) => result.events).map((event) => event.session_id);

  assert.equal(new Set(installationIds).size, 1);
  assert.equal(new Set(sessionIds).size, 1);
  assert.equal(chromeApi.values.local[TELEMETRY_STORAGE_KEYS.installationId], installationIds[0]);
});

test("session_id is reused within 30 minutes and renewed after expiry", async () => {
  const chromeApi = makeChrome();
  let currentTime = 1_700_000_000_000;
  const manager = createTelemetryManager({
    chromeApi,
    now: () => currentTime,
    fetchImpl: async () => response(true),
    randomUUID: uuidSequence()
  });

  const first = await manager.track("extension_open", { surface: "popup", trigger: "toolbar" });
  const firstSession = first.events.at(-1).session_id;
  currentTime += SESSION_TIMEOUT_MS - 1;
  const reused = await manager.track("price_load", { status: "success", provider: "coingecko" });
  currentTime += SESSION_TIMEOUT_MS + 1;
  const renewed = await manager.track("price_load", { status: "success", provider: "coingecko" });

  assert.equal(reused.events[0].event_name, "price_load");
  assert.equal(reused.events[0].session_id, firstSession);
  assert.equal(renewed.events[0].event_name, "session_start");
  assert.notEqual(renewed.events.at(-1).session_id, firstSession);
});

test("events have stable schema and event_id UUIDs", () => {
  const event = createTelemetryEvent({
    eventName: "watchlist_change",
    properties: { action: "add", total_assets: 5 },
    installationId: UUIDS[0],
    sessionId: UUIDS[1],
    extensionVersion: "1.4.4",
    now: 1_700_000_000_000,
    randomUUID: () => UUIDS[2]
  });

  assert.ok(event);
  assert.equal(event.event_id, UUIDS[2]);
  assert.deepEqual(Object.keys(event), ["event_id", "installation_id", "session_id", "event_name", "occurred_at", "extension_version", "properties"]);
  assert.deepEqual(Object.keys(event.properties), EVENT_PROPERTY_KEYS.watchlist_change);
  assert.equal("zmetricsToken" in event, false);
  assert.equal("zmetricsEmail" in event, false);
  assert.equal("password" in event, false);
});

test("surface detection distinguishes popup from floating window", () => {
  assert.equal(getTelemetrySurface({ documentElement: { dataset: { zmetricsSurface: "popup" } } }), "popup");
  assert.equal(getTelemetrySurface({ documentElement: { dataset: { zmetricsSurface: "floating_window" } } }), "floating_window");
  assert.equal(getTelemetrySurface({ documentElement: { dataset: { zmetricsSurface: "unknown" } } }), null);
});

test("allowlists reject unknown or sensitive properties", () => {
  assert.equal(sanitizeProperties("watchlist_change", { action: "add", total_assets: 2, coin_id: "bitcoin" }), null);
  assert.equal(sanitizeProperties("watchlist_change", { action: "add", total_assets: 2, symbol: "BTC" }), null);
  assert.equal(sanitizeProperties("client_error", { error_code: "PRICE_FETCH_FAILED", component: "prices", password: "secret" }), null);
  assert.deepEqual(sanitizeProperties("price_load", { status: "success", provider: "coingecko" }), { status: "success", provider: "coingecko" });
  assert.deepEqual(sanitizeProperties("price_load", { status: "error", provider: "coingecko" }), { status: "error", provider: "coingecko" });
});

test("analytics opt-out prevents event creation and clears pending queue", async () => {
  const chromeApi = makeChrome();
  let requests = 0;
  const manager = createTelemetryManager({ chromeApi, fetchImpl: async () => { requests += 1; return response(true); }, randomUUID: uuidSequence() });
  await manager.enqueue([{ event_id: UUIDS[0] }]);
  await manager.setEnabled(false);

  const result = await manager.track("install");
  assert.equal(result.disabled, true);
  assert.equal(requests, 0);
  assert.deepEqual(await manager.readQueue(), []);
});

test("queue is FIFO, capped, and retries keep event_id stable", async () => {
  const chromeApi = makeChrome();
  const requests = [];
  let shouldSucceed = false;
  const manager = createTelemetryManager({
    chromeApi,
    fetchImpl: async (_url, options) => {
      requests.push(JSON.parse(options.body).events.map((event) => event.event_id));
      return response(shouldSucceed);
    }
  });
  const events = Array.from({ length: MAX_QUEUE_SIZE + 5 }, (_, index) => ({ event_id: `event-${index}` }));
  await manager.enqueue(events);
  assert.deepEqual((await manager.readQueue()).map((event) => event.event_id), events.slice(5).map((event) => event.event_id));

  await manager.flush();
  assert.deepEqual((await manager.readQueue()).slice(0, 10).map((event) => event.event_id), events.slice(5, 15).map((event) => event.event_id));
  assert.deepEqual(requests[0], events.slice(5, 15).map((event) => event.event_id));

  shouldSucceed = true;
  await manager.flush();
  assert.notDeepEqual((await manager.readQueue()).map((event) => event.event_id), events.slice(5).map((event) => event.event_id));
});
