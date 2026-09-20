import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/layout";
import {
  Hero,
  FeatureTabs,
  FeatureShortcut,
  FeatureCustomize,
  FinalCta,
} from "@/components/site/sections";
import { absoluteOgImageUrl, canonicalUrl, SITE_CONFIG } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZMetrics — Crypto Price Tracker for Chrome" },
      {
        name: "description",
        content:
          "A lightweight crypto price tracker for Chrome with live prices, market caps and 24h changes — always one click away.",
      },
      { property: "og:title", content: "ZMetrics — Crypto Price Tracker for Chrome" },
      {
        property: "og:description",
        content:
          "A lightweight crypto price tracker for Chrome with live prices, market caps and 24h changes — always one click away.",
      },
      { property: "og:url", content: SITE_CONFIG.siteUrl },
      { property: "og:image", content: absoluteOgImageUrl },
      { property: "og:image:alt", content: "ZMetrics crypto price tracker popup" },
      { name: "twitter:image", content: absoluteOgImageUrl },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl("/") },
      {
        rel: "preload",
        as: "image",
        href: "/assets/zmetrics-demo/zmetrics-demo-horizontal-poster.png",
        type: "image/png",
        fetchPriority: "high",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
      <FeatureTabs />
      <FeatureShortcut />
      <FeatureCustomize />
      <FinalCta />
    </SiteShell>
  );
}
