import { createFileRoute } from "@tanstack/react-router";
import { TrackCryptoPricesInChromePage } from "@/components/site/guides/track-crypto-prices-in-chrome-page";
import { absoluteOgImageUrl, canonicalUrl } from "@/config/site";

const PAGE_TITLE = "How to Track Crypto Prices in Chrome | ZMetrics";
const PAGE_DESCRIPTION =
  "Learn how to track crypto prices in Chrome with ZMetrics, including live prices, market caps, 24h changes and a custom watchlist.";

export const Route = createFileRoute("/guides/track-crypto-prices-in-chrome")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      {
        property: "og:url",
        content: canonicalUrl("/guides/track-crypto-prices-in-chrome"),
      },
      { property: "og:image", content: absoluteOgImageUrl },
      { property: "og:image:alt", content: "ZMetrics crypto price tracker popup" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
      { name: "twitter:image", content: absoluteOgImageUrl },
    ],
    links: [
      {
        rel: "canonical",
        href: canonicalUrl("/guides/track-crypto-prices-in-chrome"),
      },
    ],
  }),
  component: TrackCryptoPricesInChromeRoute,
});

function TrackCryptoPricesInChromeRoute() {
  return <TrackCryptoPricesInChromePage />;
}
