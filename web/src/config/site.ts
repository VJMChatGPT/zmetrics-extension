export const SITE_CONFIG = {
  siteUrl: "https://zmetrics.net",
  chromeWebStoreUrl:
    import.meta.env["VITE_CHROME_WEB_STORE_URL"] ?? "https://chromewebstore.google.com/",
  xUrl: "https://x.com/zmetrics_net",
  ogImagePath: "/og-image.png",
  assets: {
    mark: "/assets/zmetrics-mark.png",
    wordmark: "/assets/zmetrics-wordmark.png",
    popup: "/assets/zmetrics-popup.png",
  },
} as const;

export const absoluteOgImageUrl = `${SITE_CONFIG.siteUrl}${SITE_CONFIG.ogImagePath}`;

export function canonicalUrl(pathname: string): string {
  const url = new URL(pathname, `${SITE_CONFIG.siteUrl}/`);
  url.search = "";
  url.hash = "";
  return url.toString();
}
