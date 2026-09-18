import { Link } from "@tanstack/react-router";
import {
  Activity,
  PieChart,
  TrendingUp,
  Zap,
  Eye,
  Wind,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ChromeButton, Shortcut } from "./brand";
import { BrowserMockup, FloatingWindow, SearchCard, ReorderCard, CurrencyCard } from "./mockups";
import { cn } from "@/lib/utils";

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 px-5 py-20 md:px-8 md:py-28", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Heading({
  eyebrow,
  title,
  text,
  center,
}: {
  eyebrow?: string;
  title: string;
  text: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{text}</p>
    </div>
  );
}

function Points({
  items,
  className,
}: {
  items: { icon: React.ElementType; label: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="card-glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  return (
    <section className="glow-bg relative overflow-hidden px-5 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-rise text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Track crypto <span className="text-shine">without leaving</span> your tab.
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-xl text-lg text-muted-foreground [animation-delay:120ms]">
            Live prices, market caps and 24h changes, always one click or shortcut away.
          </p>
          <div className="animate-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:220ms]">
            <ChromeButton size="lg" />
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              See how it works <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground [animation-delay:320ms]">
            <span className="flex items-center gap-2">
              <Shortcut />
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="text-xs">or</span>
              <Shortcut mac />
              <span className="text-xs">on Mac</span>
            </span>
          </div>
        </div>
        <div className="animate-rise mx-auto mt-16 max-w-4xl [animation-delay:420ms]">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

export function FeatureTabs() {
  return (
    <Section id="features">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Heading
            eyebrow="At a glance"
            title="Check the market without switching tabs."
            text="Check the prices you care about without opening another tab, dashboard or app."
          />
          <Points
            className="mt-8 sm:grid-cols-3 lg:grid-cols-1"
            items={[
              { icon: Activity, label: "Live prices" },
              { icon: PieChart, label: "Market cap" },
              { icon: TrendingUp, label: "24h change" },
            ]}
          />
        </div>
        <BrowserMockup />
      </div>
    </Section>
  );
}

export function FeatureShortcut() {
  return (
    <Section className="border-y border-border/60 bg-surface">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative order-2 flex justify-center lg:order-1">
          <div className="glow-bg absolute inset-0 rounded-full blur-2xl" />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
            <div className="py-3 pl-3">
              <Shortcut size="lg" />
            </div>
            <FloatingWindow className="w-full animate-float" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Heading
            eyebrow="Shortcut"
            title="One shortcut away."
            text="Pop out a floating window anytime and keep the market in view while you work, browse or trade."
          />
          <Points
            className="mt-8"
            items={[
              { icon: Zap, label: "Open instantly with a shortcut" },
              { icon: Eye, label: "Keep it visible while you browse" },
              { icon: Wind, label: "Stay in your flow" },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}

export function FeatureCustomize() {
  return (
    <Section>
      <Heading
        center
        eyebrow="Customize"
        title="Make it yours."
        text="Choose the assets you follow, reorder them, and switch between USD and EUR."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          { label: "Add assets", el: <SearchCard /> },
          { label: "Reorder", el: <ReorderCard /> },
          { label: "USD / EUR", el: <CurrencyCard /> },
        ].map((c) => (
          <div key={c.label} className="group flex flex-col gap-3">
            <div className="transition-transform duration-300 group-hover:-translate-y-1">
              {c.el}
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Privacy() {
  return (
    <Section id="privacy" className="border-y border-border/60 bg-surface">
      <div className="card-glass mx-auto max-w-3xl rounded-3xl p-8 text-center md:p-12">
        <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="text-3xl font-semibold md:text-4xl">Built with privacy in mind.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
          ZMetrics is designed to be useful without getting in your way. No noisy dashboards, no
          unnecessary complexity.
        </p>
        <p className="mx-auto mt-6 max-w-lg rounded-xl bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          Anonymous product analytics may be used to improve the extension, without collecting
          browsing history, wallets or personal data.
        </p>
        <Link
          to="/privacy"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
        >
          Read Privacy Policy <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

export function FinalCta() {
  return (
    <section className="glow-bg relative overflow-hidden px-5 py-24 md:px-8 md:py-32">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
          Track crypto without breaking your flow.
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          Fast to open, easy to use, and always within reach.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ChromeButton size="lg" />
          <Link
            to="/privacy"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Read Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  );
}
