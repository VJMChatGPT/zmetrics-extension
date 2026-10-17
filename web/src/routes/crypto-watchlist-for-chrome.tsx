import { createFileRoute } from "@tanstack/react-router";
import { CryptoWatchlistForChromePage } from "@/components/site/crypto-watchlist-for-chrome-page";
import { absoluteOgImageUrl, canonicalUrl } from "@/config/site";

const PAGE_TITLE = "Crypto Watchlist for Chrome | ZMetrics";
const PAGE_DESCRIPTION =
  "Build a custom crypto watchlist in Chrome. Search, add, hide, remove and reorder assets, choose USD or EUR, and check prices in the ZMetrics popup.";
const PAGE_PATH = "/crypto-watchlist-for-chrome";

export const Route = createFileRoute("/crypto-watchlist-for-chrome")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: canonicalUrl(PAGE_PATH) },
      { property: "og:image", content: absoluteOgImageUrl },
      { property: "og:image:alt", content: "ZMetrics crypto price tracker popup" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
      { name: "twitter:image", content: absoluteOgImageUrl },
    ],
    links: [{ rel: "canonical", href: canonicalUrl(PAGE_PATH) }],
  }),
  component: CryptoWatchlistForChromePage,
});
