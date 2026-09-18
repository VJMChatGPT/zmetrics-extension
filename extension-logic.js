export const BASE_COINS = [
  { id: "bitcoin", symbol: "BTC", icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ethereum", symbol: "ETH", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "ripple", symbol: "XRP", icon: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  { id: "solana", symbol: "SOL", icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png" }
];

export function getAllCoins(baseCoins, customCoins, deletedBaseIds, coinOrder) {
  const visible = baseCoins.filter((coin) => !deletedBaseIds.includes(coin.id));
  const current = visible.concat(customCoins);
  const ids = new Set(current.map((coin) => coin.id));
  const ordered = coinOrder.filter((id) => ids.has(id));
  current.forEach((coin) => { if (!ordered.includes(coin.id)) ordered.push(coin.id); });
  const byId = new Map(current.map((coin) => [coin.id, coin]));
  return ordered.map((id) => byId.get(id)).filter(Boolean);
}

export function getActiveCoins(allCoins, enabledCoinIds) {
  return allCoins.filter((coin) => enabledCoinIds.includes(coin.id));
}

export function marketsById(markets) {
  return markets.reduce((map, market) => {
    if (market && market.id) map[market.id] = market;
    return map;
  }, {});
}

export function formatPrice(value, currency = "usd") {
  if (typeof value !== "number") return "-";
  const symbol = currency === "eur" ? "€" : "$";
  if (value >= 1000) return symbol + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1) return symbol + value.toFixed(2);
  if (value >= 0.01) return symbol + value.toFixed(4);
  return symbol + value.toPrecision(3);
}

export function formatMarketCap(value, currency = "usd") {
  if (typeof value !== "number") return "-";
  const symbol = currency === "eur" ? "€" : "$";
  if (value >= 1e12) return symbol + (value / 1e12).toFixed(2) + "T";
  if (value >= 1e9) return symbol + (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return symbol + (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return symbol + (value / 1e3).toFixed(2) + "K";
  return symbol + value.toFixed(0);
}

export function formatChange(change) {
  if (typeof change !== "number" || Number.isNaN(change)) return "-";
  return `${change > 0 ? "+" : ""}${Math.abs(change).toFixed(2)}%`;
}
