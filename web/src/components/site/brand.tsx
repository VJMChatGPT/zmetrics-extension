import { Link } from "@tanstack/react-router";
import { SITE_CONFIG } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-1.5 sm:gap-2", className)} aria-label="ZMetrics home">
      <img
        src={SITE_CONFIG.assets.mark}
        alt=""
        className="h-6 w-6 sm:h-7 sm:w-7"
        width="128"
        height="128"
      />
      <img
        src={SITE_CONFIG.assets.wordmark}
        alt="ZMetrics"
        className="h-7 -ml-1 w-auto object-contain sm:h-9"
        width="2560"
        height="800"
      />
    </Link>
  );
}

export function ChromeButton({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <a
      href={SITE_CONFIG.chromeWebStoreUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:brightness-110 hover:shadow-glow hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-2.5",
        size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm",
        className,
      )}
    >
      <ChromeIcon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      Add to Chrome
    </a>
  );
}

export function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8.4h8.9M8.9 13.8 4.4 6.2M15.1 13.8 10.7 21.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <span className="kbd">{children}</span>;
}

export function Shortcut({ mac = false, size = "md" }: { mac?: boolean; size?: "md" | "lg" }) {
  const keys = mac ? ["⌘", "Shift", "Z"] : ["Ctrl", "Shift", "Z"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "lg" && "scale-125 md:scale-150 origin-left",
      )}
    >
      {keys.map((k, i) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <Kbd>{k}</Kbd>
          {i < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
        </span>
      ))}
    </span>
  );
}
