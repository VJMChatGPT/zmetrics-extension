// background.js — gestiona la ventana flotante de ZMetrics

let popupWindowId = null;

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open_window_popup") {
    if (popupWindowId !== null) {
      try {
        const win = await chrome.windows.get(popupWindowId);
        if (win) {
          await chrome.windows.remove(popupWindowId);
          popupWindowId = null;
          return;
        }
      } catch {
        popupWindowId = null;
      }
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

    popupWindowId = newWin.id;
  }
});
