import test from "node:test";
import assert from "node:assert/strict";

function makeStorage() {
  const values = { session: {} };
  const area = (name) => ({
    get(defaults, callback) {
      callback({ ...defaults, ...values[name] });
    },
    set(next, callback) {
      Object.assign(values[name], next);
      callback?.();
    },
    remove(key, callback) {
      delete values[name][key];
      callback?.();
    }
  });
  return { values, session: area("session"), local: area("session") };
}

function eventSlot() {
  let handler = null;
  return {
    addListener(next) {
      handler = next;
    },
    async dispatch(...args) {
      return handler?.(...args);
    }
  };
}

test("shortcut toggles one floating window without reading tab URLs", async () => {
  const storage = makeStorage();
  const events = {
    command: eventSlot(),
    removed: eventSlot()
  };
  const createdWindows = [];
  const removedWindows = [];
  let nextWindowId = 42;

  globalThis.chrome = {
    commands: { onCommand: events.command },
    windows: {
      onRemoved: events.removed,
      async get(windowId) {
        if (removedWindows.includes(windowId)) throw new Error("window_closed");
        return { id: windowId, type: "popup" };
      },
      async create(options) {
        const created = { id: nextWindowId++, ...options };
        createdWindows.push(created);
        return created;
      },
      async remove(windowId) {
        removedWindows.push(windowId);
      }
    },
    storage
  };

  await import(`./background.js?test=${Date.now()}`);

  await events.command.dispatch("open_window_popup");
  assert.equal(createdWindows.length, 1);
  assert.equal(createdWindows[0].url, "window.html");
  assert.equal(storage.values.session.zmetrics_floating_window_id, 42);

  await events.command.dispatch("open_window_popup");
  assert.deepEqual(removedWindows, [42]);
  assert.equal(storage.values.session.zmetrics_floating_window_id, undefined);

  await Promise.all([
    events.command.dispatch("open_window_popup"),
    events.command.dispatch("open_window_popup")
  ]);
  assert.equal(createdWindows.length, 2);
  assert.deepEqual(removedWindows, [42, 43]);
});
