// background.js — gestiona la ventana flotante de ZMetrics

const OPEN_WINDOW_COMMAND = "open_window_popup";
const WINDOW_URL = chrome.runtime.getURL("window.html");

let popupWindowId = null;

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
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== OPEN_WINDOW_COMMAND) return;

  await togglePopupWindow();
});
