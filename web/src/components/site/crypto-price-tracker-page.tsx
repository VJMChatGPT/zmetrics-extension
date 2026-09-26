import {
  Activity,
  Check,
  Eye,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  Wind,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChromeButton, Shortcut } from "./brand";
import {
  BrowserMockup,
  CurrencyCard,
  FloatingWindow,
  ReorderCard,
  SearchCard,
} from "./mockups";
import { SiteShell } from "./layout";

function PageSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative isolate px-5 py-24 md:px-8 md:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{text}</p>
    </div>
  );
}

function FeaturePoint({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

const FAQS = [
  {
    question: "What is a crypto price tracker?",
    answer:
      "A crypto price tracker shows current cryptocurrency prices and market data so you can check the market quickly. ZMetrics focuses on live prices, market caps and 24h changes in a compact Chrome popup.",
  },
  {
    question: "Is ZMetrics a Chrome extension?",
    answer:
      "Yes. ZMetrics is a Chrome extension that opens from the browser toolbar or with a keyboard shortcut, and it can also show a floating window while you browse.",
  },
  {
    question: "Can I customize my crypto watchlist?",
    answer:
      "Yes. You can search for assets, add the ones you follow, reorder them and switch between USD and EUR display.",
  },
  {
    question: "Does ZMetrics track my wallet?",
    answer:
      "No. ZMetrics is for checking market prices. It does not track wallet balances, holdings or trades. See the Privacy Policy for the current data and permissions details.",
  },
];

export function CryptoPriceTrackerPage() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[620px] w-[1100px] -translate-x-1/2 section-halo" />
        <div className="aurora-blob pointer-events-none absolute -left-40 top-40 -z-10 h-[420px] w-[420px]" />
        <div className="aurora-blob-indigo pointer-events-none absolute -right-40 top-10 -z-10 h-[460px] w-[460px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Crypto tracking for Chrome
            </p>
            <h1 className="animate-rise text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
              A crypto price tracker built for Chrome
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg text-muted-foreground [animation-delay:120ms]">
              Track live crypto prices, market caps and 24h changes without opening another
              dashboard.
            </p>
            <div className="animate-rise mt-8 flex justify-center [animation-delay:220ms]">
              <ChromeButton size="lg" />
            </div>
          </div>
          <div className="animate-rise mx-auto mt-16 max-w-5xl [animation-delay:320ms]">
            <BrowserMockup />
          </div>
        </div>
      </section>

      <PageSection id="market-overview" className="overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Market overview"
            title="See the market at a glance"
            text="Get the information you need for a quick market check, without the noise of a full trading dashboard."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FeaturePoint
              icon={Activity}
              title="Live prices"
              text="Check current prices for the assets on your watchlist."
            />
            <FeaturePoint
              icon={PieChart}
              title="Market cap"
              text="Understand the relative size of the assets you follow."
            />
            <FeaturePoint
              icon={TrendingUp}
              title="24h changes"
              text="See daily movement without opening another tab."
            />
            <FeaturePoint
              icon={WalletCards}
              title="USD or EUR"
              text="Choose the currency that fits your daily workflow."
            />
          </div>
        </div>
      </PageSection>

      <PageSection className="overflow-hidden">
        <div className="section-veil pointer-events-none absolute inset-0 -z-10" />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 flex justify-center lg:order-1">
            <div className="section-halo pointer-events-none absolute inset-0" />
            <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
              <div className="py-3 pl-3">
                <Shortcut size="lg" />
              </div>
              <FloatingWindow className="w-full animate-float" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Workflow"
              title="Track crypto without breaking your flow"
              text="Open the popup from the toolbar, use a keyboard shortcut or keep the floating window visible while you browse."
            />
            <ul className="mt-8 grid gap-3">
              {[
                { icon: Zap, label: "Open the tracker with a keyboard shortcut" },
                { icon: Eye, label: "Keep market data visible while you work" },
                { icon: Wind, label: "Check prices without opening a dashboard" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="card-glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid items-stretch gap-5 md:grid-cols-2">
          <div className="card-glass rounded-2xl p-6 md:p-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Check className="h-4 w-4" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold">A crypto tracker, not a portfolio dashboard</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              ZMetrics is designed for quick market checks. It helps you see prices and market
              movement, then get back to what you were doing.
            </p>
          </div>
          <div className="card-glass rounded-2xl p-6 md:p-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/10 text-muted-foreground">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold">Focused on market data</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              It does not track wallets, holdings or trades. For portfolio management, use a tool
              built for that purpose. ZMetrics stays focused on fast price checks in Chrome.
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection className="overflow-hidden">
        <div className="aurora-blob-indigo pointer-events-none absolute -bottom-20 -left-20 -z-10 h-[420px] w-[420px]" />
        <SectionHeading
          center
          eyebrow="Watchlist"
          title="Follow the assets that matter to you"
          text="Build a simple crypto watchlist around your workflow. Add assets, reorder them and choose how prices are displayed."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="group flex flex-col gap-3">
            <div className="transition-transform duration-300 group-hover:-translate-y-1">
              <SearchCard />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Search and add assets
            </p>
          </div>
          <div className="group flex flex-col gap-3">
            <div className="transition-transform duration-300 group-hover:-translate-y-1">
              <ReorderCard />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Reorder your watchlist
            </p>
          </div>
          <div className="group flex flex-col gap-3">
            <div className="transition-transform duration-300 group-hover:-translate-y-1">
              <CurrencyCard />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              Choose USD or EUR
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="card-glass mx-auto max-w-4xl rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <SectionHeading
                eyebrow="Privacy and trust"
                title="Focused permissions for a focused tool"
                text="ZMetrics uses the permissions and market-data access needed to provide the tracker. It does not need access to the content of the pages you browse."
              />
              <Link
                to="/privacy"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
              >
                Read the Privacy Policy
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection id="faq" className="pt-8 md:pt-12">
        <SectionHeading
          center
          eyebrow="FAQ"
          title="Crypto price tracking, clearly explained"
          text="A few answers before you add ZMetrics to Chrome."
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
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
      </PageSection>

      <section className="relative isolate overflow-hidden px-5 py-28 md:px-8 md:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 section-halo" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            Start tracking crypto in Chrome
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Fast to open, easy to customize and always within reach.
          </p>
          <div className="mt-8 flex justify-center">
            <ChromeButton size="lg" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
