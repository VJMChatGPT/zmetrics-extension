import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/layout";
import { absoluteOgImageUrl, canonicalUrl, SITE_CONFIG } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - ZMetrics" },
      { name: "description", content: "How the ZMetrics Chrome extension handles data." },
      { property: "og:title", content: "Privacy Policy - ZMetrics" },
      { property: "og:description", content: "How the ZMetrics Chrome extension handles data." },
      { property: "og:url", content: `${SITE_CONFIG.siteUrl}/privacy` },
      { property: "og:image", content: absoluteOgImageUrl },
      { property: "og:image:alt", content: "ZMetrics crypto price tracker popup" },
      { name: "twitter:image", content: absoluteOgImageUrl },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    title: "Overview",
    body: "ZMetrics is a Chrome extension that shows live crypto prices, market caps and 24h changes in a compact popup or floating window. It does not require an account.",
  },
  {
    title: "Information we do not collect",
    body: "ZMetrics does not collect browsing history, the URLs you visit, wallet addresses, passwords, authentication tokens, or the contents of the pages you view. Watchlist events do not include coin IDs, symbols or names.",
  },
  {
    title: "Pseudonymous analytics",
    body: "If analytics are enabled, the extension creates a pseudonymous installation ID once and stores it locally in chrome.storage.local. It also creates short-lived session IDs that expire after inactivity. These IDs are not created from your email, account or browsing activity.",
  },
  {
    title: "Analytics events",
    body: "Analytics may include installation and update events, extension opens, price-load success or error status, currency changes, watchlist change counts, and limited client error codes. Events use an event ID, installation ID, session ID, extension version and an allowlisted set of properties.",
  },
  {
    title: "Opt-out",
    body: "Analytics can be disabled from the extension settings. When disabled, no new analytics events are created and pending local analytics events are cleared.",
  },
  {
    title: "Service providers",
    body: "Analytics events are sent to the ZMetrics telemetry endpoint and stored in Supabase. Accepted events may also be forwarded server-side to Google Analytics 4 using the GA4 Measurement Protocol. The extension does not send events directly to Supabase or GA4, and service credentials are kept server-side.",
  },
  {
    title: "Data security",
    body: "Telemetry requests use HTTPS. Supabase Row Level Security is enabled for the analytics table, and the service role used to store events is restricted to the server-side Edge Function. GA4 credentials are also kept server-side. Access to telemetry systems is limited to the services needed to operate and improve ZMetrics.",
  },
  {
    title: "Retention",
    body: "We retain telemetry records only for as long as reasonably necessary to operate, secure and improve ZMetrics, investigate errors or abuse, and meet legal obligations. We periodically delete or anonymize data that is no longer needed and do not retain telemetry indefinitely. Operational logs are rotated and retained only for the period needed for reliability and security work.",
  },
  {
    title: "Your settings",
    body: "Tracked assets, their order and your currency preference are stored locally in your browser so the extension can remember them.",
  },
  {
    title: "Contact",
    body: "For questions about this Privacy Policy or ZMetrics data practices, contact support@zmetrics.net.",
  },
  {
    title: "Changes to this Privacy Policy",
    body: "We may update this Privacy Policy when ZMetrics changes or when additional clarification is needed. We will update the date shown on this page and describe material changes here. Your continued use of the extension after an update means the revised policy applies to future use.",
  },
];

function PrivacyPage() {
  return (
    <SiteShell>
      <section className="glow-bg px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Privacy
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">Last updated: September 18, 2026</p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            This Privacy Policy explains how ZMetrics handles information when you use the Chrome
            extension.
          </p>
          <div className="mt-12 space-y-4">
            {SECTIONS.map((s) => (
              <div key={s.title} className="card-glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
