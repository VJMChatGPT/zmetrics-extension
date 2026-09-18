export const TELEMETRY_ENDPOINT = "https://zmetrics.net/api/telemetry";
export const TELEMETRY_TRACK_MESSAGE = "zmetrics:telemetry-track";
export const TELEMETRY_FLUSH_MESSAGE = "zmetrics:telemetry-flush";
export const TELEMETRY_SET_ENABLED_MESSAGE = "zmetrics:telemetry-set-enabled";
export const TELEMETRY_STORAGE_KEYS = {
  analyticsEnabled: "analyticsEnabled",
  installationId: "telemetry_installation_id",
  queue: "telemetry_queue",
  session: "telemetry_session"
};
export const MAX_QUEUE_SIZE = 100;
export const TELEMETRY_BATCH_SIZE = 10;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const TELEMETRY_EVENTS = Object.freeze([
  "install",
  "update",
  "session_start",
  "extension_open",
  "price_load",
  "watchlist_change",
  "currency_change",
  "client_error"
]);

export const EVENT_PROPERTY_KEYS = Object.freeze({
  install: [],
  update: ["previous_version"],
  session_start: [],
  extension_open: ["surface", "trigger"],
  price_load: ["status", "provider"],
  watchlist_change: ["action", "total_assets"],
  currency_change: ["currency"],
  client_error: ["error_code", "component"]
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXTENSION_VERSION_PATTERN = /^[0-9A-Za-z._-]{1,32}$/;
const ERROR_CODE_PATTERN = /^[A-Z0-9_]{1,64}$/;
const COMPONENT_PATTERN = /^[a-z0-9_-]{1,32}$/;

export function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isExtensionVersion(value) {
  return typeof value === "string" && EXTENSION_VERSION_PATTERN.test(value);
}

export function sanitizeProperties(eventName, properties = {}) {
  if (!TELEMETRY_EVENTS.includes(eventName) || !properties || typeof properties !== "object" || Array.isArray(properties)) {
    return null;
  }

  const allowed = EVENT_PROPERTY_KEYS[eventName];
  const unknownKeys = Object.keys(properties).filter((key) => !allowed.includes(key));
  if (unknownKeys.length > 0) return null;

  const result = {};
  for (const key of allowed) {
    if (properties[key] !== undefined) result[key] = properties[key];
  }

  if (eventName === "update" && (typeof result.previous_version !== "string" || !isExtensionVersion(result.previous_version))) return null;
  if (eventName === "extension_open" && (!['popup', 'floating_window'].includes(result.surface) || !['toolbar', 'shortcut', 'other'].includes(result.trigger))) return null;
  if (eventName === "price_load" && (!['success', 'error'].includes(result.status) || result.provider !== "coingecko")) return null;
  if (eventName === "watchlist_change" && (!['add', 'remove'].includes(result.action) || !Number.isInteger(result.total_assets) || result.total_assets < 0 || result.total_assets > 1000)) return null;
  if (eventName === "currency_change" && !['USD', 'EUR'].includes(result.currency)) return null;
  if (eventName === "client_error" && (typeof result.error_code !== "string" || !ERROR_CODE_PATTERN.test(result.error_code) || typeof result.component !== "string" || !COMPONENT_PATTERN.test(result.component))) return null;

  return result;
}

export function createTelemetryEvent({ eventName, properties = {}, installationId, sessionId, extensionVersion, now = Date.now(), randomUUID = crypto.randomUUID }) {
  const safeProperties = sanitizeProperties(eventName, properties);
  if (!safeProperties || !isUuid(installationId) || !isUuid(sessionId) || !isExtensionVersion(extensionVersion)) return null;

  return {
    event_id: randomUUID(),
    installation_id: installationId,
    session_id: sessionId,
    event_name: eventName,
    occurred_at: new Date(now).toISOString(),
    extension_version: extensionVersion,
    properties: safeProperties
  };
}

function storageGet(storage, defaults) {
  return new Promise((resolve, reject) => {
    try {
      storage.get(defaults, (result) => {
        const error = globalThis.chrome?.runtime?.lastError;
        if (error) reject(new Error(error.message || "storage_get_failed"));
        else resolve(result || {});
      });
    } catch (error) {
      reject(error);
    }
  });
}

function storageSet(storage, values) {
  return new Promise((resolve, reject) => {
    try {
      storage.set(values, () => {
        const error = globalThis.chrome?.runtime?.lastError;
        if (error) reject(new Error(error.message || "storage_set_failed"));
        else resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function createTelemetryManager({
  chromeApi = globalThis.chrome,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  randomUUID = () => crypto.randomUUID(),
  endpoint = TELEMETRY_ENDPOINT
} = {}) {
  const localStorage = chromeApi.storage.local;
  const sessionStorage = chromeApi.storage.session || chromeApi.storage.local;
  let flushing = false;
  let operation = Promise.resolve();

  function runExclusive(task) {
    const result = operation.then(task, task);
    operation = result.catch(() => {});
    return result;
  }

  async function isEnabled() {
    const result = await storageGet(localStorage, { [TELEMETRY_STORAGE_KEYS.analyticsEnabled]: true });
    return result[TELEMETRY_STORAGE_KEYS.analyticsEnabled] !== false;
  }

  async function setEnabledInternal(enabled) {
    await storageSet(localStorage, { [TELEMETRY_STORAGE_KEYS.analyticsEnabled]: Boolean(enabled) });
    if (!enabled) {
      await storageSet(localStorage, { [TELEMETRY_STORAGE_KEYS.queue]: [] });
    }
  }

  async function getIdentityInternal() {
    const local = await storageGet(localStorage, { [TELEMETRY_STORAGE_KEYS.installationId]: null });
    let installationId = local[TELEMETRY_STORAGE_KEYS.installationId];
    if (!isUuid(installationId)) {
      installationId = randomUUID();
      await storageSet(localStorage, { [TELEMETRY_STORAGE_KEYS.installationId]: installationId });
    }

    const session = await storageGet(sessionStorage, { [TELEMETRY_STORAGE_KEYS.session]: null });
    const storedSession = session[TELEMETRY_STORAGE_KEYS.session];
    const currentTime = now();
    const reusable = storedSession && isUuid(storedSession.session_id) && Number.isFinite(storedSession.last_activity_at) && currentTime - storedSession.last_activity_at <= SESSION_TIMEOUT_MS;
    const sessionId = reusable ? storedSession.session_id : randomUUID();
    await storageSet(sessionStorage, {
      [TELEMETRY_STORAGE_KEYS.session]: {
        session_id: sessionId,
        last_activity_at: currentTime
      }
    });

    return { installationId, sessionId, isNewSession: !reusable };
  }

  async function readQueueInternal() {
    const result = await storageGet(localStorage, { [TELEMETRY_STORAGE_KEYS.queue]: [] });
    return Array.isArray(result[TELEMETRY_STORAGE_KEYS.queue]) ? result[TELEMETRY_STORAGE_KEYS.queue] : [];
  }

  async function enqueueInternal(events) {
    if (!events.length) return;
    const queue = await readQueueInternal();
    const nextQueue = queue.concat(events).slice(-MAX_QUEUE_SIZE);
    await storageSet(localStorage, { [TELEMETRY_STORAGE_KEYS.queue]: nextQueue });
  }

  async function flushInternal() {
    if (flushing || !(await isEnabled())) return false;
    const queue = await readQueueInternal();
    if (!queue.length) return true;

    flushing = true;
    const batch = queue.slice(0, TELEMETRY_BATCH_SIZE);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch })
      });
      if (!response || !response.ok) throw new Error("telemetry_ingest_failed");

      const currentQueue = await readQueueInternal();
      const batchIds = new Set(batch.map((event) => event.event_id));
      await storageSet(localStorage, {
        [TELEMETRY_STORAGE_KEYS.queue]: currentQueue.filter((event) => !batchIds.has(event.event_id))
      });
      return true;
    } catch (_) {
      return false;
    } finally {
      flushing = false;
    }
  }

  async function track(eventName, properties = {}, extensionVersion) {
    return runExclusive(async () => {
      if (!(await isEnabled())) return { sent: false, disabled: true };

      const identity = await getIdentityInternal();
      const version = extensionVersion || chromeApi.runtime.getManifest().version;
      const events = [];
      if (identity.isNewSession && eventName !== "session_start") {
        const sessionStart = createTelemetryEvent({
          eventName: "session_start",
          installationId: identity.installationId,
          sessionId: identity.sessionId,
          extensionVersion: version,
          now: now(),
          randomUUID
        });
        if (sessionStart) events.push(sessionStart);
      }

      const event = createTelemetryEvent({
        eventName,
        properties,
        installationId: identity.installationId,
        sessionId: identity.sessionId,
        extensionVersion: version,
        now: now(),
        randomUUID
      });
      if (!event) return { sent: false, invalid: true };
      events.push(event);

      await enqueueInternal(events);
      await flushInternal();
      return { sent: true, events };
    });
  }

  return {
    isEnabled,
    setEnabled: (enabled) => runExclusive(() => setEnabledInternal(enabled)),
    getIdentity: () => runExclusive(getIdentityInternal),
    readQueue: () => runExclusive(readQueueInternal),
    enqueue: (events) => runExclusive(() => enqueueInternal(events)),
    flush: () => runExclusive(flushInternal),
    track
  };
}

export function trackEvent(eventName, properties = {}) {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: TELEMETRY_TRACK_MESSAGE, eventName, properties }, () => {
        void chrome.runtime.lastError;
        resolve();
      });
    });
  } catch (_) {
    return Promise.resolve();
  }
}

export function getTelemetrySurface(documentObject = globalThis.document) {
  const surface = documentObject?.documentElement?.dataset?.zmetricsSurface;
  return surface === "popup" || surface === "floating_window" ? surface : null;
}

export function setAnalyticsEnabled(enabled) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({
        type: TELEMETRY_SET_ENABLED_MESSAGE,
        enabled: Boolean(enabled)
      }, (response) => {
        const error = chrome.runtime.lastError;
        if (!error && response?.ok) {
          resolve();
          return;
        }
        const values = {
          [TELEMETRY_STORAGE_KEYS.analyticsEnabled]: Boolean(enabled),
          ...(enabled ? {} : { [TELEMETRY_STORAGE_KEYS.queue]: [] })
        };
        chrome.storage.local.set(values, () => resolve());
      });
    } catch (_) {
      const values = {
        [TELEMETRY_STORAGE_KEYS.analyticsEnabled]: Boolean(enabled),
        ...(enabled ? {} : { [TELEMETRY_STORAGE_KEYS.queue]: [] })
      };
      try {
        chrome.storage.local.set(values, () => resolve());
      } catch (_) {
        resolve();
      }
    }
  });
}

export function getAnalyticsEnabled() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get({
        [TELEMETRY_STORAGE_KEYS.analyticsEnabled]: true
      }, (result) => {
        void chrome.runtime.lastError;
        resolve(result?.[TELEMETRY_STORAGE_KEYS.analyticsEnabled] !== false);
      });
    } catch (_) {
      resolve(true);
    }
  });
}
