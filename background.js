import {
  TELEMETRY_FLUSH_MESSAGE,
  TELEMETRY_SET_ENABLED_MESSAGE,
  TELEMETRY_TRACK_MESSAGE,
  createTelemetryManager
} from "./telemetry.js";

// background.js — gestiona la ventana flotante y la telemetría de ZMetrics

const OPEN_WINDOW_COMMAND = "open_window_popup";
const WINDOW_URL = chrome.runtime.getURL("window.html");
const telemetry = createTelemetryManager();

let popupWindowId = null;
let toggleOperation = Promise.resolve();

async function findExistingPopupWindowId() {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.get(popupWindowId);
      return popupWindowId;
    } catch {
      popupWindowId = null;
    }
  }

  const windows = await chrome.windows.getAll({ populate: true });

  for (const win of windows) {
    if (win.type !== "popup" || !Array.isArray(win.tabs)) continue;

    const hasZmetricsWindowTab = win.tabs.some((tab) => tab.url === WINDOW_URL);
    if (hasZmetricsWindowTab && typeof win.id === "number") {
      popupWindowId = win.id;
      return popupWindowId;
    }
  }

  return null;
}

async function togglePopupWindow() {
  const existingWindowId = await findExistingPopupWindowId();

  if (existingWindowId !== null) {
    await chrome.windows.remove(existingWindowId);
    popupWindowId = null;
    return;
  }

  const newWin = await chrome.windows.create({
    url: "window.html",
    type: "popup",
    width: 380,
    height: 460,
    focused: true,
    left: 1200,
    top: 120
  });

  popupWindowId = typeof newWin.id === "number" ? newWin.id : null;
  if (popupWindowId !== null) {
    await telemetry.track("extension_open", {
      surface: "floating_window",
      trigger: "shortcut"
    });
  }
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== OPEN_WINDOW_COMMAND) return;

  toggleOperation = toggleOperation
    .then(() => togglePopupWindow())
    .catch(() => {});
  await toggleOperation;
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await telemetry.track("install");
  } else if (details.reason === "update") {
    await telemetry.track("update", {
      previous_version: details.previousVersion || "unknown"
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  void telemetry.flush();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === TELEMETRY_TRACK_MESSAGE) {
    void telemetry.track(message.eventName, message.properties).then(() => {
      sendResponse({ ok: true });
    }).catch(() => {
      sendResponse({ ok: false });
    });
    return true;
  }

  if (message?.type === TELEMETRY_FLUSH_MESSAGE) {
    void telemetry.flush().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === TELEMETRY_SET_ENABLED_MESSAGE) {
    void telemetry.setEnabled(message.enabled === true)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  return false;
});
