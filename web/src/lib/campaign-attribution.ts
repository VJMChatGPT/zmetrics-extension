const STORAGE_KEY = "zmetrics_campaign_session";
const PARAM = "zm_attribution";
const ENDPOINT = "/api/marketing";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Session = {
  token: string;
  session_id: string;
  expires_at: number;
  link_id?: string;
  pending: boolean;
  page_path: string;
};
let capturing: Promise<void> | undefined;

function readSession(): Session | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Session | null;
    if (
      value &&
      uuid.test(value.session_id) &&
      typeof value.token === "string" &&
      value.token.length < 2048 &&
      typeof value.pending === "boolean" &&
      typeof value.page_path === "string" &&
      value.expires_at > Date.now()
    )
      return value;
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage may be disabled. Attribution must remain optional. */
  }
  return null;
}

async function capture(): Promise<void> {
  const url = new URL(window.location.href);
  const arrival = url.searchParams.get(PARAM);
  let session = readSession();
  if (arrival !== null) {
    url.searchParams.delete(PARAM);
    // replaceState preserves unrelated query parameters, the hash and router state.
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    if (!session && arrival.length < 2048) {
      session = {
        token: arrival,
        session_id: crypto.randomUUID(),
        expires_at: Date.now() + 900_000,
        pending: true,
        page_path: url.pathname,
      };
      // Save the pending visit before the request, so refresh retries the SAME session.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }
  // First valid campaign wins within this tab's session. Internal navigation and
  // additional campaign links do not overwrite it or create another visit.
  if (!session?.pending) return;
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({
      event_type: "visit",
      token: session.token,
      session_id: session.session_id,
      page_path: session.page_path,
    }),
    keepalive: true,
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 401 || response.status === 400) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  if (!response.ok) return; // Keep pending on transient failures; retry on next navigation/refresh.
  const payload = (await response.json()) as Pick<
    Session,
    "token" | "link_id" | "session_id" | "expires_at"
  >;
  if (
    payload.session_id !== session.session_id ||
    typeof payload.token !== "string" ||
    !uuid.test(payload.link_id ?? "") ||
    payload.expires_at <= Date.now()
  )
    return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, ...payload, pending: false }));
}

export function captureCampaignAttribution(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!capturing) {
    capturing = capture()
      .catch(() => {
        /* Navigation and rendering never depend on analytics. */
      })
      .finally(() => {
        capturing = undefined;
      });
  }
  return capturing;
}

export function trackStoreClick(): void {
  if (typeof window === "undefined") return;
  const pagePath = window.location.pathname;
  const send = () => {
    try {
      const session = readSession();
      if (!session || session.pending) return;
      const body = JSON.stringify({
        event_type: "store_click",
        token: session.token,
        session_id: session.session_id,
        page_path: pagePath,
      });
      // A text/plain beacon avoids a preflight; the server parses the JSON body.
      if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body,
        keepalive: true,
        credentials: "omit",
      }).catch(() => {});
    } catch {
      /* Never preventDefault, wait for analytics, or change the CWS href. */
    }
  };
  // Early clicks can finish attribution in the background. The link opens now.
  if (capturing) void capturing.then(send);
  else if (readSession()?.pending) void captureCampaignAttribution().then(send);
  else send();
}
