import test from "node:test";
import assert from "node:assert/strict";

function makeStorage() {
  const values = { local: {}, session: {} };
  const area = (name) => ({
    get(defaults, callback) { callback({ ...defaults, ...values[name] }); },
    set(next, callback) { Object.assign(values[name], next); callback?.(); }
  });
  return { values, local: area("local"), session: area("session") };
}

function eventSlot() {
  let handler = null;
  return {
    addListener(next) { handler = next; },
    async dispatch(...args) { return handler?.(...args); }
  };
}

test("shortcut creates floating window and records one floating open event", async () => {
  const storage = makeStorage();
  const events = {
    command: eventSlot(),
    removed: eventSlot(),
    installed: eventSlot(),
    startup: eventSlot(),
    message: eventSlot()
  };
  const createdWindows = [];
  const requests = [];
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, status: 202 };
  };
  globalThis.chrome = {
    runtime: {
      lastError: null,
      getURL: (path) => `chrome-extension://test/${path}`,
      getManifest: () => ({ version: "1.4.4" }),
      onInstalled: events.installed,
      onStartup: events.startup,
      onMessage: events.message
    },
    commands: { onCommand: events.command },
    windows: {
      onRemoved: events.removed,
      async get() { return { id: 42 }; },
      async getAll() { return []; },
      async create(options) {
        createdWindows.push(options);
        return { id: 42 };
      },
      async remove() {}
    },
    storage
  };

  await import(`./background.js?test=${Date.now()}`);
  await events.installed.dispatch({ reason: "install" });
  assert.equal(requests[0].events.at(-1).event_name, "install");

  await events.installed.dispatch({ reason: "update", previousVersion: "1.4.3" });
  assert.equal(requests[1].events.at(-1).event_name, "update");
  assert.deepEqual(requests[1].events.at(-1).properties, { previous_version: "1.4.3" });

  await events.command.dispatch("open_window_popup");

  assert.equal(createdWindows.length, 1);
  assert.equal(createdWindows[0].url, "window.html");
  assert.equal(requests.length, 3);
  assert.equal(requests[2].events.at(-1).event_name, "extension_open");
  assert.deepEqual(requests[2].events.at(-1).properties, {
    surface: "floating_window",
    trigger: "shortcut"
  });

  await events.command.dispatch("open_window_popup");
  assert.equal(createdWindows.length, 1);
  assert.equal(requests.length, 3);

  await Promise.all([
    events.command.dispatch("open_window_popup"),
    events.command.dispatch("open_window_popup")
  ]);
  assert.equal(createdWindows.length, 2);
  assert.equal(requests.length, 4);
});
