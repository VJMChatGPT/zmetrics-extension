import { Link } from "@tanstack/react-router";
import { EyeOff, Search, X } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import { ChromeButton } from "./brand";
import { SiteShell } from "./layout";
import { CurrencyCard, ReorderCard, SearchCard } from "./mockups";

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative isolate px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

const ASSET_ACTIONS = [
  {
    icon: Search,
    title: "Find and add an asset",
    text: "Open Options with the gear icon, enter at least two characters of a name or ticker, then click Search or press Enter. Choose Add beside the right CoinGecko result; check the name as well as the symbol.",
  },
  {
    icon: EyeOff,
    title: "Hide it without losing it",
    text: "Uncheck an asset in Options to leave it out of the market table. It stays in your list, ready to show again when you check it. Already added in search means it is already in that list.",
  },
  {
    icon: X,
    title: "Remove what you no longer follow",
    text: "Use the cross labelled Remove from list to remove an asset. If you previously removed and re-added a default asset, removing it again can leave it unchecked in Options. Use the checkbox to show it again.",
  },
];

const FAQS = [
  {
    question: "What is the difference between hiding and removing an asset?",
    answer:
      "Hiding leaves an unchecked entry in Options. Removal takes an asset out of the list, except that a removed and re-added default asset can remain unchecked in Options. If no entry remains, search for the asset and choose Add to restore it.",
  },
  {
    question: "Can I add any cryptocurrency?",
    answer:
      "You can add assets available through the CoinGecko search used by ZMetrics. A search result does not guarantee that every market-data field will be available for that asset.",
  },
  {
    question: "Does a watchlist record my holdings?",
    answer:
      "No. Selecting an asset means you want to follow its market data. ZMetrics does not record how much you own, connect wallets or track trades.",
  },
  {
    question: "Are prices guaranteed to be real time?",
    answer:
      "No. ZMetrics requests market data from CoinGecko. Availability and freshness depend on the provider and your connection; the watchlist is for quick market checks, not guaranteed real-time trading quotes.",
  },
];

export function CryptoWatchlistForChromePage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
        <div className="section-halo pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Your assets. Your order.
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
              A crypto watchlist for Chrome, shaped around you
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Keep the assets you follow together in ZMetrics. Add new names, hide occasional
              interests and put your priorities first, then check their prices from the Chrome
              toolbar.
            </p>
            <div className="mt-8">
              <ChromeButton size="lg" />
            </div>
          </div>
          <figure className="mx-auto w-full max-w-sm">
            <img
              src={SITE_CONFIG.assets.popup}
              alt="ZMetrics popup with a selected asset list and columns for market cap, price and 24h percentage change"
              className="w-full rounded-2xl border border-border shadow-card"
              width="383"
              height="438"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Existing product capture. Prices are sample values, not current quotes; interface
              details may differ from the installed version.
            </figcaption>
          </figure>
        </div>
      </section>

      <Section>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            A list you can change, not a fixed market feed
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            Adding, hiding and removing serve different purposes. Keep a small daily view without
            having to discard every asset you might want to check later.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ASSET_ACTIONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-glass rounded-2xl p-6">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
              Put the right names at the top
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Drag asset rows with the dotted handle in Options to arrange your list. The order is
              saved automatically, so your next price check starts with the assets you care about.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Search extends the list beyond the default selection. For example, you can find a
              project by name, add the matching asset and move it above the ones you check less
              often.
            </p>
          </div>
          <figure>
            <div className="grid gap-5 sm:grid-cols-2">
              <SearchCard />
              <ReorderCard />
            </div>
            <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Illustrations of search and ordering, not interactive controls or current screenshots.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <figure className="mx-auto w-full max-w-sm lg:order-1">
            <CurrencyCard />
            <figcaption className="mt-4 text-sm text-muted-foreground">
              Currency illustration. Values shown are examples.
            </figcaption>
          </figure>
          <div className="lg:order-2">
            <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
              The same watchlist, in USD or EUR
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Choose US Dollar or Euro under Display prices in. ZMetrics saves your preference and
              displays prices and market caps in that currency. Switching currency does not buy,
              sell or convert any funds.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Open the toolbar popup for a quick check of price, market cap and 24h percentage
              change. Use refresh to request an update. These figures describe the market, not the
              value of a portfolio, and are not guaranteed real-time quotes.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="card-glass mx-auto max-w-4xl rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-semibold md:text-4xl">
            Choose your list, then get back to your tab
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            For the full setup walkthrough, read our{" "}
            <Link
              to="/guides/track-crypto-prices-in-chrome"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              guide to tracking crypto prices in Chrome
            </Link>
            . It covers installation, watchlist controls and the floating-window shortcut.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Want the broader feature overview? Explore the{" "}
            <Link
              to="/crypto-price-tracker"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              ZMetrics crypto price tracker
            </Link>
            . For details about stored preferences and market-data requests, see the{" "}
            <Link
              to="/privacy"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold md:text-4xl">Watchlist questions</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map(({ question, answer }) => (
              <details key={question} className="card-glass rounded-2xl p-5">
                <summary className="cursor-pointer text-base font-semibold">{question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            Make room for the assets you follow
          </h2>
          <p className="mt-5 text-muted-foreground md:text-lg">
            Build your list in ZMetrics and keep your next market check close.
          </p>
          <div className="mt-8 flex justify-center">
            <ChromeButton size="lg" />
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
