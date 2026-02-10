// ========= BASE COINS =========
const BASE_COINS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
  },
  {
    id: "ethereum",
    symbol: "ETH",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  },
  {
    id: "ripple",
    symbol: "XRP",
    icon: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png"
  },
  {
    id: "solana",
    symbol: "SOL",
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png"
  }
];

const FALLBACK_ICON = "icons/icon32.png";
const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets";
const COINGECKO_SEARCH_URL =
  "https://api.coingecko.com/api/v3/search";
const ZMETRICS_JWT_URL =
  "https://zmetrics.net/wp-json/jwt-auth/v1/token";

// ========= DOM ELEMENTS =========
const list              = document.getElementById("coins-list");
const time              = document.getElementById("update-time");
const refreshBtn        = document.getElementById("refresh-btn");
const settingsBtn       = document.getElementById("settings-btn");
const settingsPanel     = document.getElementById("settings-panel");
const settingsCoins     = document.getElementById("settings-coins");
const settingsClose     = document.getElementById("settings-close-btn");
const searchInput       = document.getElementById("search-input");
const searchBtn         = document.getElementById("search-btn");
const searchResults     = document.getElementById("search-results");
const shortcutDisplay   = document.getElementById("shortcut-display");
const shortcutChangeBtn = document.getElementById("shortcut-change-btn");

// Account/auth elements
const accountPanel        = document.getElementById("account-panel");
const accountToggleBtn    = document.getElementById("account-toggle-btn");
const accountLoggedOut    = document.getElementById("account-logged-out");
const accountLoggedIn     = document.getElementById("account-logged-in");
const loginEmailInput     = document.getElementById("login-email");
const loginPasswordInput  = document.getElementById("login-password");
const loginBtn            = document.getElementById("login-btn");
const signupBtn           = document.getElementById("signup-btn");
const loginErrorEl        = document.getElementById("login-error");
const accountEmailEl      = document.getElementById("account-email");
const logoutBtn           = document.getElementById("logout-btn");
const zmetricsXLink       = document.getElementById("zmetrics-x-link");
const exclusivePanels     = [
  ...new Set([
    ...Array.from(document.querySelectorAll("[data-exclusive-panel]")),
    settingsPanel,
    accountPanel
  ])
].filter(Boolean);

// ========= STATE =========
let enabledCoinIds = BASE_COINS.map(c => c.id);
let customCoins    = [];
let deletedBaseIds = [];
let coinOrder      = [];
let lastData       = null;
let activePanelId  = null;

// Auth state
let authToken = null;
let authEmail = null;

// ========= HELPERS: COIN LISTS / ORDER =========
function getBaseVisible() {
  return BASE_COINS.filter(c => !deletedBaseIds.includes(c.id));
}

function buildAllCoinsUnordered() {
  return getBaseVisible().concat(customCoins);
}

function syncCoinOrderWithCurrentCoins() {
  const currentIds = buildAllCoinsUnordered().map(c => c.id);

  let cleaned = coinOrder.filter(id => currentIds.includes(id));

  currentIds.forEach(id => {
    if (!cleaned.includes(id)) cleaned.push(id);
  });

  coinOrder = cleaned;
}

function getAllCoins() {
  const unordered = buildAllCoinsUnordered();
  const map = new Map(unordered.map(c => [c.id, c]));

  syncCoinOrderWithCurrentCoins();

  return coinOrder
    .map(id => map.get(id))
    .filter(Boolean);
}

// ========= DRAG & DROP FOR SETTINGS LIST =========
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.currentTarget;
  draggedElement.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (!draggedElement || draggedElement === target) return;

  const items = Array.from(
    settingsCoins.querySelectorAll(".settings-coin-item")
  );
  const draggingIndex = items.indexOf(draggedElement);
  const targetIndex   = items.indexOf(target);

  if (draggingIndex < targetIndex) {
    settingsCoins.insertBefore(draggedElement, target.nextSibling);
  } else {
    settingsCoins.insertBefore(draggedElement, target);
  }
}

function handleDragEnd() {
  if (!draggedElement) return;
  draggedElement.classList.remove("dragging");

  const items = Array.from(
    settingsCoins.querySelectorAll(".settings-coin-item")
  );
  coinOrder = items.map(it => it.dataset.id);

  chrome.storage.sync.set(
    { customCoins, enabledCoinIds, deletedBaseIds, coinOrder },
    () => {
      renderTable();
    }
  );

  draggedElement = null;
}

// ========= AUTH RENDERING =========
function renderAuthState() {
  if (!accountLoggedOut || !accountLoggedIn) return;

  if (authToken && authEmail) {
    accountLoggedOut.style.display = "none";
    accountLoggedIn.style.display = "flex";
    if (accountEmailEl) {
      accountEmailEl.textContent = authEmail;
    }
    if (loginErrorEl) {
      loginErrorEl.textContent = "";
    }
  } else {
    accountLoggedOut.style.display = "flex";
    accountLoggedIn.style.display = "none";
    if (accountEmailEl) {
      accountEmailEl.textContent = "";
    }
  }
}

function setLoginError(message) {
  if (loginErrorEl) {
    loginErrorEl.textContent = message || "";
  }
}

function setLoginLoading(isLoading) {
  if (!loginBtn) return;
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Logging in…" : "Log in";
}

function setActivePanel(panelId) {
  activePanelId = panelId;

  exclusivePanels.forEach((panel) => {
    const shouldShow = panel.id === activePanelId;
    panel.classList.toggle("hidden", !shouldShow);
  });
}

function togglePanel(panelId) {
  if (!panelId) return;
  const nextPanelId = activePanelId === panelId ? null : panelId;
  setActivePanel(nextPanelId);
}

// ========= AUTH HELPERS (for future use) =========
/**
 * Returns a promise resolving to { token, email } or { token: null, email: null }.
 */
function getZMetricsAuth() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        zmetricsToken: null,
        zmetricsEmail: null
      },
      (res) => {
        resolve({
          token: res.zmetricsToken || null,
          email: res.zmetricsEmail || null
        });
      }
    );
  });
}

// ========= INIT =========
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(
    {
      enabledCoinIds: BASE_COINS.map(c => c.id),
      customCoins: [],
      deletedBaseIds: [],
      coinOrder: [],
      zmetricsToken: null,
      zmetricsEmail: null
    },
    (res) => {
      enabledCoinIds = Array.isArray(res.enabledCoinIds)
        ? res.enabledCoinIds
        : BASE_COINS.map(c => c.id);
      customCoins    = Array.isArray(res.customCoins) ? res.customCoins : [];
      deletedBaseIds = Array.isArray(res.deletedBaseIds) ? res.deletedBaseIds : [];
      coinOrder      = Array.isArray(res.coinOrder) ? res.coinOrder : [];

      authToken = res.zmetricsToken || null;
      authEmail = res.zmetricsEmail || null;

      syncCoinOrderWithCurrentCoins();
      renderSettingsList();
      renderAuthState();
      fetchPrices();
      setInterval(fetchPrices, 60000);

      if (shortcutDisplay && chrome.commands && chrome.commands.getAll) {
        chrome.commands.getAll((commands) => {
          const cmd = commands.find(c => c.name === "open_window_popup");
          if (cmd && cmd.shortcut) {
            shortcutDisplay.textContent = cmd.shortcut;
          } else {
            shortcutDisplay.textContent = "Not set";
          }
        });
      }
    }
  );
});

// ========= EVENT LISTENERS =========
// Refresh
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    refreshBtn.classList.add("spin");
    fetchPrices().finally(() => {
      setTimeout(() => refreshBtn.classList.remove("spin"), 600);
    });
  });
}

// Settings toggle
if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener("click", () => {
    togglePanel(settingsPanel?.id);
  });
}

if (settingsClose && settingsPanel) {
  settingsClose.addEventListener("click", () => {
    setActivePanel(null);
  });
}

// Account dropdown toggle
if (accountToggleBtn && accountPanel) {
  accountToggleBtn.addEventListener("click", () => {
    togglePanel(accountPanel.id);
  });
}

// Search coins
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q.length < 2) {
      searchResults.innerHTML =
        `<div class="search-info">Type at least 2 characters.</div>`;
      return;
    }
    searchCoins(q);
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });
}

// Shortcut change: opens Chrome shortcut settings
if (shortcutChangeBtn) {
  shortcutChangeBtn.addEventListener("click", () => {
    const shortcutsUrl = "chrome://extensions/shortcuts";

    if (chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: shortcutsUrl }, () => {
        if (chrome.runtime.lastError) {
          window.location.href = shortcutsUrl;
        }
      });
      return;
    }

    window.location.href = shortcutsUrl;
  });
}

// Auth: login
if (loginBtn) {
  loginBtn.addEventListener("click", handleLoginSubmit);
}
if (loginEmailInput) {
  loginEmailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLoginSubmit();
    }
  });
}
if (loginPasswordInput) {
  loginPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLoginSubmit();
    }
  });
}

// Auth: logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    authToken = null;
    authEmail = null;
    chrome.storage.sync.set(
      { zmetricsToken: null, zmetricsEmail: null },
      () => {
        renderAuthState();
      }
    );
  });
}

// Auth: signup opens new tab
if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://zmetrics.net/signup?source=extension"
    });
  });
}


if (zmetricsXLink) {
  zmetricsXLink.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://x.com/zmetrics_net"
    });
  });
}

// ========= AUTH: LOGIN HANDLER =========
async function handleLoginSubmit() {
  if (!loginEmailInput || !loginPasswordInput) return;

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  setLoginError("");

  if (!email || !password) {
    setLoginError("Please enter email and password.");
    return;
  }

  setLoginLoading(true);

  try {
    const res = await fetch(ZMETRICS_JWT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const errorMessage =
        (data && (data.message || data?.data?.message)) ||
        "Invalid email or password.";
      setLoginError(errorMessage);
      return;
    }

    const token =
      (data && (data.token || data?.data?.token)) || null;
    const userEmail =
      (data && (data.user_email || data?.data?.user_email)) || email;

    if (!token) {
      setLoginError("Unexpected server response. Please try again.");
      return;
    }

    authToken = token;
    authEmail = userEmail;

    chrome.storage.sync.set(
      {
        zmetricsToken: token,
        zmetricsEmail: userEmail
      },
      () => {
        if (loginPasswordInput) loginPasswordInput.value = "";
        renderAuthState();
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    setLoginError("Network error. Please check your connection.");
  } finally {
    setLoginLoading(false);
  }
}

// ========= PRICE FETCHING =========
async function fetchPrices() {
  const allCoins   = getAllCoins();
  const activeList = allCoins.filter(c => enabledCoinIds.includes(c.id));

  if (activeList.length === 0) {
    list.innerHTML =
      `<div class="zm-empty">No assets selected. Open settings to choose what to track.</div>`;
    time.textContent = "";
    return;
  }

  try {
    const idsParam = activeList.map(c => c.id).join(",");
    const url =
      COINGECKO_MARKETS_URL +
      `?vs_currency=usd&ids=${idsParam}&price_change_percentage=24h`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const markets = await res.json();
    const map = {};
    markets.forEach(m => {
      if (m && m.id) map[m.id] = m;
    });
    lastData = map;

    renderTable();
  } catch (err) {
    console.error("Error fetching prices:", err);

    if (!lastData) {
      list.innerHTML =
        `<div class="zm-error">Error loading prices. Please try again.</div>`;
      time.textContent = "";
    } else {
      time.textContent =
        "Error updating. Showing last available data.";
    }
  }
}

// ========= SEARCH COINS =========
async function searchCoins(query) {
  searchResults.innerHTML = `<div class="search-info">Searching…</div>`;

  try {
    const url =
      COINGECKO_SEARCH_URL + "?query=" + encodeURIComponent(query);
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    const results = (data.coins || []).slice(0, 10);

    if (results.length === 0) {
      searchResults.innerHTML =
        `<div class="search-info">No coins found for "${query}".</div>`;
      return;
    }

    renderSearchResults(results);
  } catch (err) {
    console.error("Error searching coins:", err);
    searchResults.innerHTML =
      `<div class="search-info">Error while searching. Please try again.</div>`;
  }
}

function renderSearchResults(results) {
  const allCoins = getAllCoins();
  searchResults.innerHTML = "";

  results.forEach((coin) => {
    const alreadyExists = allCoins.some(c => c.id === coin.id);

    const item = document.createElement("div");
    item.className = "search-result-item";

    const icon = document.createElement("img");
    icon.className = "search-result-icon";
    icon.src = coin.thumb || coin.large || FALLBACK_ICON;
    icon.alt = coin.symbol || "";

    const textWrap = document.createElement("div");
    textWrap.className = "search-result-text";

    const line1 = document.createElement("div");
    line1.className = "search-result-symbol";
    line1.textContent = (coin.symbol || "").toUpperCase();

    const line2 = document.createElement("div");
    line2.className = "search-result-name";
    line2.textContent = coin.name || "";

    textWrap.appendChild(line1);
    textWrap.appendChild(line2);

    const action = document.createElement("div");
    action.className = "search-result-action";

    const btn = document.createElement("button");

    if (alreadyExists) {
      btn.textContent = "Already added";
      btn.disabled = true;
      btn.classList.add("already");
    } else {
      btn.textContent = "Add";
      btn.addEventListener("click", () => {
        addCustomCoinFromSearch(coin);
      });
    }

    action.appendChild(btn);

    item.appendChild(icon);
    item.appendChild(textWrap);
    item.appendChild(action);
    searchResults.appendChild(item);
  });
}

function addCustomCoinFromSearch(coin) {
  const allCoins = buildAllCoinsUnordered();
  if (allCoins.some(c => c.id === coin.id)) return;

  const newCoin = {
    id: coin.id,
    symbol: (coin.symbol || "").toUpperCase(),
    icon: coin.thumb || coin.large || FALLBACK_ICON
  };

  customCoins.push(newCoin);

  if (!enabledCoinIds.includes(newCoin.id)) {
    enabledCoinIds.push(newCoin.id);
  }

  if (!coinOrder.includes(newCoin.id)) {
    coinOrder.push(newCoin.id);
  }

  chrome.storage.sync.set(
    { customCoins, enabledCoinIds, deletedBaseIds, coinOrder },
    () => {
      syncCoinOrderWithCurrentCoins();
      renderSettingsList();
      fetchPrices();
      searchResults.innerHTML =
        `<div class="search-info">Added ${newCoin.symbol} to your list.</div>`;
    }
  );
}

// ========= REMOVE COIN =========
function removeCoin(id) {
  if (BASE_COINS.some(c => c.id === id)) {
    if (!deletedBaseIds.includes(id)) {
      deletedBaseIds.push(id);
    }
  } else {
    customCoins = customCoins.filter(c => c.id !== id);
  }

  enabledCoinIds = enabledCoinIds.filter(cid => cid !== id);
  coinOrder      = coinOrder.filter(cid => cid !== id);

  chrome.storage.sync.set(
    { customCoins, enabledCoinIds, deletedBaseIds, coinOrder },
    () => {
      syncCoinOrderWithCurrentCoins();
      renderSettingsList();
      renderTable();
    }
  );
}

// ========= RENDER MAIN TABLE =========
function renderTable() {
  list.innerHTML = "";
  if (!lastData) return;

  const allCoins   = getAllCoins();
  const activeList = allCoins.filter(c => enabledCoinIds.includes(c.id));

  if (activeList.length === 0) {
    list.innerHTML =
      `<div class="zm-empty">No assets selected. Open settings to choose what to track.</div>`;
    time.textContent = "";
    return;
  }

  activeList.forEach((coin) => {
    const m = lastData[coin.id];
    const price  = m?.current_price ?? null;
    const mcap   = m?.market_cap ?? null;
    const change = (typeof m?.price_change_percentage_24h === "number")
      ? m.price_change_percentage_24h
      : (typeof m?.price_change_percentage_24h_in_currency === "number"
        ? m.price_change_percentage_24h_in_currency
        : null);

    const row = document.createElement("div");
    row.className = "zm-row";

    const direction =
      typeof change === "number"
        ? change > 0
          ? "up"
          : change < 0
          ? "down"
          : "flat"
        : "flat";

    const iconUrl = (coin.icon || m?.image || FALLBACK_ICON);

    row.innerHTML = `
      <div class="cell-asset">
        <img class="coin-icon" src="${iconUrl}" alt="${coin.symbol}">
        <div class="coin-text">
          <div class="coin-symbol">${coin.symbol}</div>
        </div>
      </div>

      <div class="cell-marketcap">
        ${mcap != null ? formatMarketCap(mcap) : "—"}
      </div>

      <div class="cell-price">
        ${price != null ? formatPrice(price) : "—"}
      </div>

      <div class="cell-change ${direction}">
        ${formatChange(change)}
      </div>
    `;

    list.appendChild(row);
  });

  time.textContent = "Updated: " + new Date().toLocaleTimeString();
}

// ========= RENDER SETTINGS LIST =========
function renderSettingsList() {
  settingsCoins.innerHTML = "";

  const allCoins = getAllCoins();

  allCoins.forEach((coin) => {
    const wrapper = document.createElement("div");
    wrapper.className = "settings-coin-item";
    wrapper.dataset.id = coin.id;
    wrapper.draggable = true;

    wrapper.addEventListener("dragstart", handleDragStart);
    wrapper.addEventListener("dragover", handleDragOver);
    wrapper.addEventListener("dragend", handleDragEnd);

    const main = document.createElement("label");
    main.className = "settings-coin-main";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = coin.id;
    input.checked = enabledCoinIds.includes(coin.id);
    input.addEventListener("change", onToggleCoin);

    const icon = document.createElement("img");
    icon.src = coin.icon || FALLBACK_ICON;
    icon.alt = coin.symbol;
    icon.className = "settings-coin-icon";

    const text = document.createElement("span");
    text.textContent = coin.symbol;

    main.appendChild(input);
    main.appendChild(icon);
    main.appendChild(text);
    wrapper.appendChild(main);

    const controls = document.createElement("div");
    controls.className = "settings-coin-controls";

    const dragHandle = document.createElement("div");
    dragHandle.className = "settings-coin-drag-handle";
    dragHandle.textContent = "⋮⋮";
    dragHandle.title = "Drag to reorder";

    const delBtn = document.createElement("button");
    delBtn.className = "settings-coin-delete";
    delBtn.textContent = "✕";
    delBtn.title = "Remove from list";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      removeCoin(coin.id);
    });

    controls.appendChild(dragHandle);
    controls.appendChild(delBtn);

    wrapper.appendChild(controls);
    settingsCoins.appendChild(wrapper);
  });
}

function onToggleCoin(e) {
  const id = e.target.value;
  const checked = e.target.checked;

  if (checked) {
    if (!enabledCoinIds.includes(id)) enabledCoinIds.push(id);
  } else {
    enabledCoinIds = enabledCoinIds.filter(cid => cid !== id);
  }

  chrome.storage.sync.set(
    { enabledCoinIds, customCoins, deletedBaseIds, coinOrder },
    () => {
      renderTable();
    }
  );
}

// ========= FORMAT HELPERS =========
function formatPrice(value) {
  if (typeof value !== "number") return "—";
  if (value >= 1000) {
    return "$" + value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  if (value >= 1) return "$" + value.toFixed(2);
  if (value >= 0.01) return "$" + value.toFixed(4);
  return "$" + value.toPrecision(3);
}

function formatMarketCap(value) {
  if (typeof value !== "number") return "—";
  if (value >= 1e12) return "$" + (value / 1e12).toFixed(2) + "T";
  if (value >= 1e9)  return "$" + (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6)  return "$" + (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3)  return "$" + (value / 1e3).toFixed(2) + "K";
  return "$" + value.toFixed(0);
}

function formatChange(change) {
  if (typeof change !== "number" || isNaN(change)) return "—";
  const sign = change > 0 ? "+" : "";
  const abs = Math.abs(change).toFixed(2);
  return `${sign}${abs}%`;
}
