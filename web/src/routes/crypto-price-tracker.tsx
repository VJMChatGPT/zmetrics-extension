import { createFileRoute } from "@tanstack/react-router";
import { CryptoPriceTrackerPage } from "@/components/site/crypto-price-tracker-page";
import { absoluteOgImageUrl, canonicalUrl } from "@/config/site";

const PAGE_TITLE = "Crypto Price Tracker for Chrome | ZMetrics";
const PAGE_DESCRIPTION =
  "Track live crypto prices, market caps and 24h changes in Chrome with a lightweight popup, custom watchlist and keyboard shortcut.";

export const Route = createFileRoute("/crypto-price-tracker")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: canonicalUrl("/crypto-price-tracker") },
      { property: "og:image", content: absoluteOgImageUrl },
      { property: "og:image:alt", content: "ZMetrics crypto price tracker popup" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
      { name: "twitter:image", content: absoluteOgImageUrl },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/crypto-price-tracker") }],
  }),
  component: CryptoPriceTrackerRoute,
});

function CryptoPriceTrackerRoute() {
  return <CryptoPriceTrackerPage />;
}
