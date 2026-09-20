import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  PieChart,
  TrendingUp,
  Zap,
  Eye,
  Wind,
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
    <section
      id={id}
      className={cn("relative isolate scroll-mt-20 px-5 py-24 md:px-8 md:py-32", className)}
    >

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
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[620px] w-[1100px] -translate-x-1/2 section-halo" />
      <div className="aurora-blob pointer-events-none absolute -z-10 -left-40 top-40 h-[420px] w-[420px]" />
      <div className="aurora-blob-indigo pointer-events-none absolute -z-10 -right-40 top-10 h-[460px] w-[460px]" />
      <div className="relative mx-auto max-w-6xl">


        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-rise text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
            Track crypto <span className="text-shine">without leaving</span> your tab.
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-xl text-lg text-muted-foreground [animation-delay:120ms]">
            A lightweight crypto price tracker for Chrome with live prices, market caps and 24h
            changes — always one click or shortcut away.
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
          <div className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-muted-foreground [animation-delay:320ms]">
            <span className="inline-flex items-center">
              <Shortcut />
            </span>
            <span className="hidden items-center justify-center px-1 text-xs leading-none sm:inline-flex">
              or
            </span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <Shortcut mac />
              <span className="text-xs">on Mac</span>
            </span>
          </div>
        </div>
        <div className="animate-rise mx-auto mt-16 max-w-5xl [animation-delay:420ms]">
          <ProductVideo />
        </div>
      </div>
    </section>
  );
}

export function FeatureTabs() {
  return (
    <Section id="features" className="overflow-hidden">
      <div className="aurora-blob pointer-events-none absolute -z-10 right-[-10%] top-10 h-[520px] w-[520px]" />
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">

        <div className="min-w-0">
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
        <BrowserMockup className="min-w-0" />
      </div>
    </Section>
  );
}

export function FeatureShortcut() {
  return (
    <Section>
      <div className="section-veil pointer-events-none absolute inset-0 -z-10" />
      <div className="fade-rule pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="fade-rule pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative order-2 flex min-w-0 justify-center lg:order-1">
          <div className="section-halo pointer-events-none absolute inset-0" />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
            <div className="py-3 pl-3">
              <Shortcut size="lg" />
            </div>
            <FloatingWindow className="w-full animate-float" />
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
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
    <Section className="overflow-hidden">
      <div className="aurora-blob-indigo pointer-events-none absolute -z-10 left-[-8%] bottom-0 h-[480px] w-[480px]" />
      <div className="aurora-blob pointer-events-none absolute -z-10 right-[-8%] top-0 h-[380px] w-[380px]" />
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

function ProductVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShouldLoad(true), 1000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;

    const video = videoRef.current;
    video.load();
    void video.play().catch(() => undefined);
  }, [shouldLoad]);

  const playVideo = () => {
    void videoRef.current?.play().catch(() => undefined);
  };

  return (
    <div className="card-glass overflow-hidden rounded-3xl p-2 shadow-glow md:p-3">
      <video
        ref={videoRef}
        className="block w-full rounded-2xl"
        autoPlay
        controls
        loop
        muted
        playsInline
        preload="none"
        poster="/assets/zmetrics-demo/zmetrics-demo-horizontal-poster.png"
        width={1280}
        height={720}
        onLoadedData={playVideo}
        aria-label="ZMetrics extension demo"
      >
        {shouldLoad ? (
          <>
            <source src="/assets/zmetrics-demo/zmetrics-demo-horizontal.webm" type="video/webm" />
            <source src="/assets/zmetrics-demo/zmetrics-demo-horizontal.mp4" type="video/mp4" />
          </>
        ) : null}
      </video>
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-28 md:px-8 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 section-halo" />

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
