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
    body: "ZMetrics is a Chrome extension that shows live crypto prices, market caps and 24h changes in a compact popup or floating window. No account is required. This policy describes the information ZMetrics stores locally or in Chrome Sync and the information it sends to CoinGecko to provide market data.",
  },
  {
    title: "All data we collect and process",
    body: "ZMetrics processes watchlist and display preferences; selected asset IDs, currency and market-data requests; search text sent to CoinGecko when you search for an asset; and coin IDs, symbols and icon URLs returned by CoinGecko and selected for a custom asset. Network and service providers may also process ordinary request metadata such as IP address, browser information and request time. ZMetrics does not use this information for personalized advertising or sell it.",
  },
  {
    title: "chrome.storage.sync data",
    body: "The extension stores enabled asset IDs, custom asset IDs, custom symbols, custom icon URLs, removed default asset IDs, asset order and selected currency in chrome.storage.sync. Chrome may synchronize this data across the user's Chrome profile using Chrome Sync. ZMetrics uses it to restore preferences and the watchlist. The extension does not store account credentials or analytics data in chrome.storage.sync.",
  },
  {
    title: "CoinGecko data sharing",
    body: "To provide prices and market data, ZMetrics sends the selected asset IDs, selected currency and the requested 24-hour price-change field to CoinGecko's markets API. When you search for an asset, the search text is sent to CoinGecko's search API. CoinGecko responses are processed temporarily in the extension to display prices and search results. Selected search results may be stored as custom asset ID, symbol and icon URL in chrome.storage.sync. Coin images may be loaded from CoinGecko-hosted URLs. CoinGecko may receive normal request metadata under its own privacy policy.",
  },
  {
    title: "Marketing tracking",
    body: "ZMetrics does not use Google Analytics. Marketing links record only the link, source, campaign, timestamp and referrer before redirecting.",
  },
  {
    title: "Vercel and website logs",
    body: "When you visit zmetrics.net, Vercel and other website infrastructure providers may process standard operational metadata such as IP address, user agent, request time, status and network information. The Chrome extension does not send telemetry or marketing tracking requests to zmetrics.net or Supabase. Each provider controls its own operational logs under its applicable settings and privacy policy.",
  },
  {
    title: "Chrome Sync and local browser processing",
    body: "ZMetrics uses chrome.storage.sync for watchlist and display preferences. It uses chrome.storage.session to remember the ID of its floating window while the browser session is active, with chrome.storage.local as a fallback when session storage is unavailable. It requests windows to create, find and close the floating tracker window. It uses chrome.tabs.create only to open user-requested Chrome shortcut settings and X links; it does not declare the tabs permission and does not read tab URLs, browsing history or page content. The api.coingecko.com host permission is used for market prices and searches. There are no content scripts.",
  },
  {
    title: "Information we do not collect",
    body: "ZMetrics does not collect or transmit browsing history, visited domains, active page content, cookies, form data, wallet addresses, balances, payment information, location, contacts, files, page titles, email addresses, passwords or authentication tokens. It does not create analytics identifiers, send usage events or profile users across websites.",
  },
  {
    title: "Data retention",
    body: "Preferences and custom watchlist data remain in chrome.storage.sync until you change them, clear the extension's stored data or remove the extension, subject to Chrome Sync behavior. The floating-window ID is kept only for the active browser session when chrome.storage.session is available, with a local fallback if necessary. CoinGecko and website infrastructure providers retain request or operational data according to their own settings and policies. ZMetrics does not control those provider retention periods and does not make a fixed retention promise for them.",
  },
  {
    title: "User deletion rights and choices",
    body: "You can remove locally stored preferences and the floating-window ID by clearing the extension's stored data or removing the extension, subject to Chrome Sync behavior. You can also remove or change individual watchlist and display preferences from the extension settings. To ask about data controlled by ZMetrics, contact support@zmetrics.net. Deletion from CoinGecko, Chrome Sync, Vercel or other third-party systems is subject to the relevant provider's systems and policies and may require a separate request to that provider.",
  },
  {
    title: "Data security",
    body: "ZMetrics sends market-data and search requests over HTTPS. The extension contains no account credentials, authentication tokens or analytics service credentials. No passwords or authentication tokens are sent to CoinGecko or any analytics provider. No security measure can eliminate all risk, so users should keep their Chrome profile secure.",
  },
  {
    title: "Chrome Web Store Limited Use compliance",
    body: "ZMetrics complies with the Chrome Web Store User Data Policy and Limited Use requirements. User data is used only to provide, secure and maintain the extension's single purpose, quick cryptocurrency price tracking. ZMetrics does not sell user data or use it for personalized, retargeted or interest-based advertising. Data is transferred only when necessary to provide the extension or comply with law and security requirements.",
  },
  {
    title: "Contact",
    body: "For privacy questions, access or deletion requests, contact support@zmetrics.net. Please do not send passwords, authentication tokens or other sensitive credentials by email.",
  },
  {
    title: "Changes to this Privacy Policy",
    body: "We may update this Privacy Policy when ZMetrics changes or when additional clarification is needed. We will update the date shown on this page and describe material changes here. If an update materially changes how the extension handles user data, we will provide an appropriate prominent notice in the extension or its store materials before applying the new practice where required. Your continued use of the extension after an update means the revised policy applies to future use.",
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
          <p className="mt-4 text-muted-foreground">Last updated: September 26, 2026</p>
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



