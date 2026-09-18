import { Link } from "@tanstack/react-router";
import { ChromeButton, Logo } from "./brand";
import { SITE_CONFIG } from "@/config/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <ChromeButton className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm" />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 text-center md:px-8">
        <div className="flex flex-col items-center gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            ZMetrics - Quick crypto tracking for Chrome.
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <a
            href={SITE_CONFIG.xUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M18.2 2H21l-6.5 7.4L22 22h-6.8l-4.7-6.2L5 22H2.2l7-8L2 2h6.9l4.3 5.7L18.2 2Zm-1.2 18h1.7L7.1 3.9H5.3L17 20Z" />
            </svg>
            X / Twitter
          </a>
        </nav>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
