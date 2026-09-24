export const SITE_CONFIG = {
  siteUrl: "https://zmetrics.net",
  chromeWebStoreUrl:
    import.meta.env["VITE_CHROME_WEB_STORE_URL"] ??
    "https://chromewebstore.google.com/detail/zmetrics-%E2%80%93-crypto-price-t/ipihfpalipjpdoboegoemfhfldcpdeke?hl=en-US&utm_source=ext_sidebar",
  xUrl: "https://x.com/zmetrics_net",
  ogImagePath: "/og-image.png",
  assets: {
    mark: "/assets/zmetrics-mark.webp",
    wordmark: "/assets/zmetrics-wordmark.webp",
    popup: "/assets/zmetrics-popup.webp",
  },
} as const;

export const absoluteOgImageUrl = `${SITE_CONFIG.siteUrl}${SITE_CONFIG.ogImagePath}`;

export function canonicalUrl(pathname: string): string {
  const url = new URL(pathname, `${SITE_CONFIG.siteUrl}/`);
  url.search = "";
  url.hash = "";
  return url.toString();
}
