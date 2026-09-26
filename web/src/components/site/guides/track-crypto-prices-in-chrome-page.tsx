import {
  ArrowRight,
  Check,
  Eye,
  Keyboard,
  LockKeyhole,
  WalletCards,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChromeButton, Shortcut } from "../brand";
import {
  BrowserMockup,
  CurrencyCard,
  FloatingWindow,
  ReorderCard,
  SearchCard,
} from "../mockups";
import { SiteShell } from "../layout";

function ArticleSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-5 py-16 md:px-8 md:py-24 ${className}`}>
      <div className="mx-auto max-w-3xl">{children}</div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold leading-tight md:text-4xl">{children}</h2>;
}

function BodyCopy({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">{children}</p>;
}

const FAQS = [
  {
    question: "Can I track crypto prices directly in Chrome?",
    answer:
      "Yes. A Chrome extension can show market prices in a popup or floating window, so you can check the market without opening a separate dashboard.",
  },
  {
    question: "Is there a Chrome extension for crypto prices?",
    answer:
      "Yes. ZMetrics is a Chrome crypto price tracker for quick checks of live prices, market caps and 24h changes.",
  },
  {
    question: "Can I customize my crypto watchlist?",
    answer:
      "Yes. You can search for assets, add them to your list, change their order and choose between USD and EUR display.",
  },
  {
    question: "Does ZMetrics track my wallet?",
    answer:
      "No. ZMetrics is designed for price tracking. It does not manage wallets, holdings or trades. See the Privacy Policy for the current data and permissions details.",
  },
];

export function TrackCryptoPricesInChromePage() {
  return (
    <SiteShell>
      <article>
        <header className="relative isolate overflow-hidden px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[600px] w-[1050px] -translate-x-1/2 section-halo" />
          <div className="aurora-blob pointer-events-none absolute -left-40 top-40 -z-10 h-[420px] w-[420px]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              ZMetrics guide
            </p>
            <h1 className="animate-rise text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
              How to track crypto prices in Chrome
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:120ms] md:text-xl">
              Checking crypto prices should not require a collection of open tabs. This guide
              explains the practical ways to follow market data in Chrome and where a focused
              browser extension fits.
            </p>
            <div className="animate-rise mt-8 flex justify-center [animation-delay:220ms]">
              <ChromeButton size="lg" />
            </div>
          </div>
        </header>

        <ArticleSection>
          <SectionTitle>Why track crypto prices in Chrome?</SectionTitle>
          <BodyCopy>
            Crypto markets move throughout the day, but checking them can interrupt the work you
            are already doing. Opening several websites, finding the right market pair and
            switching back to your task adds friction to a simple question: what is the price
            right now?
          </BodyCopy>
          <BodyCopy>
            A browser-based workflow keeps that check close to the context where you need it. You
            can see a short list of relevant assets, review their daily movement and return to
            your tab without turning a quick update into a full research session.
          </BodyCopy>
        </ArticleSection>

        <ArticleSection className="relative isolate overflow-hidden">
          <div className="section-veil pointer-events-none absolute inset-0 -z-10" />
          <SectionTitle>What is the easiest way to track crypto prices in Chrome?</SectionTitle>
          <BodyCopy>
            There are three common approaches. Dedicated crypto websites provide extensive market
            information, but they usually require another tab. Dashboards can combine charts,
            portfolios and news, but they are more than you need for a fast price check.
          </BodyCopy>
          <BodyCopy>
            A Chrome extension is useful when the goal is speed. It can place a compact tracker in
            the browser toolbar, keep a small watchlist ready and open without taking you away
            from the page you are reading. The right choice depends on whether you need full
            portfolio management or simply want current market data close at hand.
          </BodyCopy>
          <div className="mt-10">
            <BrowserMockup />
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionTitle>Install the ZMetrics Chrome extension</SectionTitle>
          <BodyCopy>
            ZMetrics is built for quick market checks inside Chrome. To get started, open its
            official Chrome Web Store listing, install the extension and open it from the browser
            toolbar. The first view gives you a compact list of tracked assets and their current
            market data.
          </BodyCopy>
          <ol className="mt-8 grid gap-3">
            {[
              "Install ZMetrics from the Chrome Web Store.",
              "Open the extension from the Chrome toolbar.",
              "Choose the assets you want to follow.",
            ].map((step, index) => (
              <li key={step} className="card-glass flex items-center gap-4 rounded-xl p-4 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </ArticleSection>

        <ArticleSection>
          <SectionTitle>Open the tracker and choose your assets</SectionTitle>
          <BodyCopy>
            A useful crypto price tracker should show the assets you actually follow, rather than
            forcing you through a long market list every time. ZMetrics lets you search for assets
            and add them to a personal watchlist.
          </BodyCopy>
          <BodyCopy>
            After adding an asset, you can arrange the list around your priorities. You can also
            choose whether prices appear in USD or EUR, so the display matches the way you review
            the market.
          </BodyCopy>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="card-glass rounded-2xl p-4">
              <SearchCard />
              <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
                Add assets
              </p>
            </div>
            <div className="card-glass rounded-2xl p-4">
              <ReorderCard />
              <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
                Set the order
              </p>
            </div>
            <div className="card-glass rounded-2xl p-4">
              <CurrencyCard />
              <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
                Choose a currency
              </p>
            </div>
          </div>
        </ArticleSection>

        <ArticleSection className="relative isolate overflow-hidden">
          <div className="aurora-blob-indigo pointer-events-none absolute -bottom-20 -right-40 -z-10 h-[460px] w-[460px]" />
          <div className="grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionTitle>Track prices with a popup, shortcut and floating window</SectionTitle>
              <BodyCopy>
                When you need a quick update, open the popup from the toolbar. For a faster
                workflow, use the keyboard shortcut to open the tracker without reaching for the
                mouse.
              </BodyCopy>
              <div className="mt-8 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Keyboard className="h-4 w-4 text-primary" />
                <Shortcut />
              </div>
              <BodyCopy>
                The floating window gives you another option when you want market data to remain
                visible beside the page you are working on.
              </BodyCopy>
            </div>
            <FloatingWindow className="w-full max-w-sm justify-self-center animate-float" />
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionTitle>Customize your crypto watchlist</SectionTitle>
          <BodyCopy>
            Personalization is useful when your market routine changes. Add the assets that matter
            to you, remove anything you no longer need and reorder the list so the most relevant
            prices appear first.
          </BodyCopy>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Check, label: "Choose personal assets" },
              { icon: Eye, label: "Keep the important prices visible" },
              { icon: WalletCards, label: "Switch between USD and EUR" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="card-glass flex items-center gap-3 rounded-xl p-4 text-sm font-medium">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </ArticleSection>

        <ArticleSection>
          <div className="card-glass rounded-3xl p-7 md:p-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <WalletCards className="h-5 w-5" />
            </div>
            <SectionTitle>Is ZMetrics a portfolio tracker?</SectionTitle>
            <BodyCopy>
              No. ZMetrics is designed for price tracking and quick market checks. It does not
              manage wallets, record holdings or track trades. If you need balances, transaction
              history or portfolio performance, you need a dedicated portfolio tool.
            </BodyCopy>
          </div>
        </ArticleSection>

        <ArticleSection>
          <div className="card-glass rounded-3xl p-7 md:p-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <SectionTitle>Privacy and permissions</SectionTitle>
            <BodyCopy>
              ZMetrics uses focused permissions for its extension features, including storing your
              preferences and supporting the floating window. Market data is requested from
              CoinGecko. The extension does not access the content of the pages you browse.
            </BodyCopy>
            <Link
              to="/privacy"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
            >
              Read the Privacy Policy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionTitle>Frequently asked questions</SectionTitle>
          <div className="mt-8 space-y-3">
            {FAQS.map(({ question, answer }) => (
              <details key={question} className="card-glass group rounded-2xl p-5">
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold marker:hidden">
                  <span className="relative block after:absolute after:right-0 after:top-0 after:text-xl after:font-normal after:text-muted-foreground after:content-['+'] group-open:after:content-['−']">
                    {question}
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </ArticleSection>

        <section className="relative isolate overflow-hidden px-5 py-28 md:px-8 md:py-36">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 section-halo" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
              Start tracking crypto in Chrome
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Keep the market close without adding another dashboard to your workflow.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ChromeButton size="lg" />
              <Link
                to="/crypto-price-tracker"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore ZMetrics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
