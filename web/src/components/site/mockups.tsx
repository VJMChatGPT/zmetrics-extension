import { GripVertical, Search, Plus } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import { cn } from "@/lib/utils";

export function PopupImage({ className }: { className?: string }) {
  return (
    <img
      src={SITE_CONFIG.assets.popup}
      alt="ZMetrics extension popup showing BTC, ETH, XRP and SOL prices"
      className={cn("w-full rounded-2xl border border-border shadow-card", className)}
      draggable={false}
    />
  );
}

/** Browser window with a generic page and the real ZMetrics popup docked top‑right */
export function BrowserMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="card-glass overflow-hidden rounded-2xl">
        {/* chrome bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-loss/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-3/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-gain/70" />
          </div>
          <div className="mx-auto flex h-7 w-full max-w-md items-center rounded-md bg-background/70 px-3 text-xs text-muted-foreground">
            <span className="truncate">docs.example.com/quarterly-report</span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <img
              src={SITE_CONFIG.assets.mark}
              alt=""
              className="h-4 w-4"
              width="128"
              height="128"
            />
          </div>
        </div>
        {/* page skeleton */}
        <div className="relative aspect-[16/10] p-6 md:p-8">
          <div className="flex h-full gap-6">
            <div className="hidden w-40 shrink-0 space-y-3 md:block">
              <div className="h-3 w-24 rounded bg-foreground/15" />
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded bg-foreground/[0.07]"
                  style={{ width: `${55 + ((i * 17) % 40)}%` }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="h-5 w-2/3 rounded bg-foreground/20" />
              <div className="h-3 w-1/2 rounded bg-foreground/10" />
              <div className="mt-6 space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded bg-foreground/[0.07]"
                    style={{ width: `${70 + ((i * 23) % 30)}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-foreground/[0.05]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* popup overlay */}
      <div className="absolute right-3 top-12 w-[58%] max-w-[300px] animate-float md:right-6 md:top-14">
        <PopupImage className="shadow-glow" />
      </div>
    </div>
  );
}

/** Small floating window: title bar + popup screenshot */
export function FloatingWindow({ className }: { className?: string }) {
  return (
    <div className={cn("card-glass overflow-hidden rounded-2xl", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img
            src={SITE_CONFIG.assets.mark}
            alt=""
            className="h-3.5 w-3.5"
            width="128"
            height="128"
          />
          ZMetrics
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground/20" />
          <span className="h-2 w-2 rounded-full bg-foreground/20" />
        </div>
      </div>
      <PopupImage className="rounded-none border-0 shadow-none" />
    </div>
  );
}

const ASSETS = [
  { s: "BTC", n: "Bitcoin", c: "bg-chart-3" },
  { s: "ETH", n: "Ethereum", c: "bg-chart-4" },
  { s: "XRP", n: "XRP", c: "bg-foreground/70" },
  { s: "SOL", n: "Solana", c: "bg-gain" },
];

const COIN_ASSETS: Record<string, string> = {
  BTC: "/assets/coins/bitcoin.png",
  ETH: "/assets/coins/ethereum.png",
  XRP: "/assets/coins/xrp.png",
  SOL: "/assets/coins/solana.png",
  SOLV: "/assets/coins/solv.jpg",
  BNB: "/assets/coins/bnb.png",
  HYPE: "/assets/coins/hype.jpg",
};

function Coin({ c, s }: { c: string; s: string }) {
  const asset = COIN_ASSETS[s];

  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-background",
        asset ? "bg-foreground/10" : c,
      )}
    >
      {asset ? (
        <img
          src={asset}
          alt=""
          aria-hidden="true"
          className="h-full w-full rounded-full object-contain"
          width="28"
          height="28"
          draggable={false}
        />
      ) : (
        s[0]
      )}
    </span>
  );
}

export function SearchCard() {
  return (
    <div className="card-glass rounded-2xl p-4">
      <div className="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">sol</span>
        <span className="h-4 w-px animate-pulse bg-primary" />
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {[
          { s: "SOL", n: "Solana", c: "bg-gain", add: true },
          { s: "SOLV", n: "Solv Protocol", c: "bg-chart-1" },
        ].map((a) => (
          <li
            key={a.s}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-foreground/5"
          >
            <span className="flex items-center gap-2.5">
              <Coin c={a.c} s={a.s} />
              <span className="font-semibold">{a.s}</span>
              <span className="text-muted-foreground">{a.n}</span>
            </span>
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md",
                a.add
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/10 text-muted-foreground",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReorderCard() {
  return (
    <div className="card-glass rounded-2xl p-4">
      <p className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Tracked assets
      </p>
      <ul className="space-y-1.5 text-sm">
        {ASSETS.map((a, i) => (
          <li
            key={a.s}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-2",
              i === 1 && "translate-x-1 bg-foreground/[0.07] ring-1 ring-primary/40 shadow-glow",
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Coin c={a.c} s={a.s} />
            <span className="font-semibold">{a.s}</span>
            <span className="text-muted-foreground">{a.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CurrencyCard() {
  return (
    <div className="card-glass rounded-2xl p-4">
      <p className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Currency
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-background/70 p-1 text-sm font-semibold">
        <span className="rounded-lg bg-primary py-2 text-center text-primary-foreground">
          USD $
        </span>
        <span className="rounded-lg py-2 text-center text-muted-foreground">EUR €</span>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg px-2 text-sm">
        <span className="flex items-center gap-2.5">
          <Coin c="bg-chart-3" s="BTC" />
          <span className="font-semibold">BTC</span>
        </span>
        <span className="font-semibold tabular-nums">$77,892.00</span>
      </div>
    </div>
  );
}
