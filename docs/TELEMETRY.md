# ZMetrics telemetry

This document describes the first production-oriented telemetry implementation. It is intentionally pseudonymous and privacy-first. Supabase is the source of truth; Google Analytics 4 is a secondary forwarding destination.

## 1. Architecture

```text
popup.html / window.html
        |
        v
    telemetry.js
        | chrome.runtime.sendMessage
        v
background.js (service worker)
        |
        v
chrome.storage.local FIFO queue (max 100 events)
        |
        v
https://zmetrics.net/api/telemetry
        |
        v
Supabase Edge Function: telemetry-ingest
        |                         |
        v                         v
analytics_events             GA4 Measurement Protocol
```

The extension never calls Supabase or GA4 directly. The service worker owns installation identity, sessions, queuing and retries. Telemetry failures are swallowed and never block price loading, the popup, or the floating window.

## 2. Events and properties

| Event | Properties |
| --- | --- |
| `install` | none |
| `update` | `previous_version` |
| `session_start` | none |
| `extension_open` | `surface`, `trigger` |
| `price_load` | `status`, `provider` |
| `watchlist_change` | `action`, `total_assets` |
| `currency_change` | `currency` |
| `client_error` | `error_code`, `component` |

Every event also contains `event_id`, `installation_id`, `session_id`, `event_name`, `occurred_at`, `extension_version` and `properties`.

The allowlist is strict. Asset IDs, symbols, names, search terms, URLs, API responses and query parameters are never included. Reordering assets is not tracked.

## 3. Installation identity and sessions

`installation_id` is generated with a random UUID on the first event and stored in `chrome.storage.local`. It is not derived from email, authentication, IP, machine identity, browser fingerprint, wallet or URL. It is reused for that browser extension installation.

`session_id` is another random UUID stored in `chrome.storage.session`. A session is reused while there has been activity within 30 minutes. After 30 minutes of inactivity a new session is created and `session_start` is queued before the next event.

The toolbar popup records `extension_open` with `surface=popup` and `trigger=toolbar`. The shortcut records `extension_open` with `surface=floating_window` and `trigger=shortcut` in the service worker. `window.html` does not emit a second open event, avoiding double counting.

## 4. Queue and delivery

The queue is FIFO and stored in `chrome.storage.local`. It holds at most 100 events and drops the oldest events if that limit is exceeded. Requests are sent in batches of at most 10 events.

The event UUID remains unchanged during retries. A successful HTTP response removes the batch from the queue. A failed request leaves it queued without an aggressive retry loop. The service worker retries on the next telemetry opportunity and on extension startup.

Disabling analytics clears pending events so they cannot be sent later. Re-enabling analytics allows new events to be collected again.

## 5. Privacy

We collect:

- a random installation identifier;
- a random session identifier;
- extension opens;
- basic feature usage;
- extension version;
- technical success/error signals.

We do not collect:

- browsing history, active URLs, domains, tabs or page titles;
- wallets, balances or financial information;
- coin-specific watchlist data, IDs, symbols or names;
- search queries;
- names, emails, passwords or personal information;
- authentication tokens, cookies or sensitive headers.

The endpoint is public by design because no secret can be protected inside a Chrome extension. Payload limits, UUID validation, event/property allowlists, timestamp validation and idempotency reduce abuse but do not prove event authenticity. Add stronger server-side rate limiting if the product scales.

The application does not persist an IP address, but the reverse proxy, Supabase and GA4 may retain normal operational/request metadata under their own retention and privacy policies. Review those provider settings before release.

## 6. Analytics opt-out

Settings contains the checkbox:

> Help improve ZMetrics by sharing anonymous usage statistics.

The preference is `analyticsEnabled` in `chrome.storage.local` and defaults to enabled. When false, no new events are generated, no queued events are sent and the queue is cleared.

## 7. Supabase database

Migration path:

`supabase/migrations/20260918000000_create_analytics_events.sql`

It creates `public.analytics_events` with indexes for time, event type/time and installation/time. RLS is enabled and `anon`/`authenticated` have no table privileges or public insert/select policies. Only the server-side Edge Function uses the service role to insert.

The migration has not been executed remotely.

## 8. Edge Function

Function path:

`supabase/functions/telemetry-ingest/index.ts`

It accepts only JSON `POST` batches, with a 64 KiB body limit and 20-event batch limit. It validates HTTP method, content type, payload shape, UUIDs, timestamps, event names, event-specific properties, extension versions and allowed values. Unknown fields are rejected.

Duplicate `event_id` values are ignored by the database primary key/upsert operation and are not forwarded a second time to GA4. After a successful Supabase insert, the function forwards only newly inserted events to GA4. A GA4 failure is logged but does not roll back or discard the Supabase data.

## 9. Secrets and GA4

The function reads these environment variables only on the server:

- `GA4_MEASUREMENT_ID` — expected value `G-LGCQP8HW2B`;
- `GA4_API_SECRET` — already configured in the ZMetrics Supabase project; never place its value in this repository.

Supabase Edge Functions also need their normal project URL and service-role environment variables. Never expose the service role key or GA4 API secret in extension code.

GA4 receives a deterministic GA4-compatible `client_id` derived from the random installation UUID, so the same installation always maps to the same GA4 client. GA4 requires a numeric `session_id` for this integration, so the function derives a deterministic numeric grouping value from the random session UUID and also keeps the original UUID in the non-identifying `zmetrics_session_id` parameter. Supabase keeps the original UUIDs as the source of truth.

GA4 reserves the event name `session_start`. Supabase stores the required `session_start` event unchanged; the GA4 forwarder maps it to `zmetrics_session_start` while the generated GA4 `session_id` still creates the session grouping.

## 10. Exact deployment steps

These commands are for the ZMetrics project only:

```bash
supabase login
supabase link --project-ref mdtvrhfzwmdunawjarvs
supabase migration list
supabase db push
supabase functions deploy telemetry-ingest --project-ref mdtvrhfzwmdunawjarvs --no-verify-jwt
supabase functions list --project-ref mdtvrhfzwmdunawjarvs
```

Before `supabase db push`, review the migration in this repository. The command must be run while linked to project ref `mdtvrhfzwmdunawjarvs`; do not run it against the currently connected Codex project.

The function will be available at:

`https://mdtvrhfzwmdunawjarvs.supabase.co/functions/v1/telemetry-ingest`

The function is deployed without Supabase JWT verification because the public Chrome client has no safe secret. The function's own validation remains mandatory.

The GA4 secrets are expected to already exist. If they need to be configured by the project owner, use the Supabase dashboard or:

```bash
supabase secrets set GA4_MEASUREMENT_ID=G-LGCQP8HW2B GA4_API_SECRET=<value-not-committed> --project-ref mdtvrhfzwmdunawjarvs
```

Do not put `<value-not-committed>` or the real secret in Git, `.env` files that are committed, screenshots or logs.

## 11. zmetrics.net reverse proxy

The extension remains configured to call:

`https://zmetrics.net/api/telemetry`

The zmetrics.net operator must proxy that path to the deployed function URL above. The proxy must:

1. forward `POST` bodies unchanged;
2. preserve `Content-Type: application/json`;
3. support `OPTIONS` if the browser sends a CORS preflight;
4. avoid caching the endpoint;
5. use a short upstream timeout and return the upstream status;
6. avoid logging request bodies, which contain pseudonymous event data.

For an Nginx-managed deployment, the shape is:

```nginx
location = /api/telemetry {
    proxy_pass https://mdtvrhfzwmdunawjarvs.supabase.co/functions/v1/telemetry-ingest;
    proxy_set_header Host mdtvrhfzwmdunawjarvs.supabase.co;
    proxy_set_header Content-Type application/json;
    proxy_pass_request_body on;
    proxy_buffering off;
    proxy_read_timeout 10s;
}
```

The exact configuration depends on the hosting provider. If zmetrics.net uses Cloudflare, a Worker/route or the provider's managed reverse-proxy feature can implement the same behavior. No zmetrics.net backend infrastructure is assumed or changed by this repository.

## 12. Troubleshooting

- If the extension reports no telemetry errors but the queue grows, inspect the proxy response and Edge Function logs; the UI deliberately stays silent.
- If the function returns `invalid_event`, compare the payload with the event/property table above. Do not loosen the allowlist to accept arbitrary data.
- If Supabase rows exist but GA4 is empty, check the two server secrets and GA4 Measurement Protocol responses. Supabase rows are retained.
- If `extension_open` is doubled, confirm only `popup.html` is marked `popup` and that `window.html` is not emitting its own open event.
- If opt-out appears ineffective, inspect `chrome.storage.local.analyticsEnabled` and confirm the local queue is empty.

## 13. Chrome Web Store release checklist

Before publishing or updating the extension, review manually:

- Privacy practices and the current Privacy Policy;
- Chrome Web Store data collection disclosure;
- purpose of collecting anonymous usage statistics;
- analytics opt-out behavior;
- `storage`, `windows` and `tabs` permissions;
- `https://api.coingecko.com/*` and `https://zmetrics.net/*` host permissions;
- whether the new telemetry changes any permission warning or disclosure;
- whether store screenshots and listing text accurately describe the feature.

This implementation does not automatically certify compliance with Chrome Web Store policies. The publisher must complete the current policy and disclosure review manually.

## 14. What remains unverified before deployment

Without deploying to project `mdtvrhfzwmdunawjarvs`, this repository cannot verify the remote migration, RLS behavior, Edge Function runtime, reverse proxy, GA4 delivery or production CORS. After deployment, run the smoke test below and inspect both Supabase rows and function logs.

## 15. Post-deployment smoke test

1. Deploy the migration and function using the exact project ref above.
2. Configure the zmetrics.net reverse proxy.
3. Load the unpacked extension in Chrome and open the popup once.
4. Open Settings, confirm analytics is enabled, change USD/EUR, add and remove a test asset, then trigger one refresh.
5. Toggle analytics off and confirm no new requests are made and pending local telemetry is cleared.
6. Toggle it on again and repeat one harmless event.
7. Verify a `202` response from `/api/telemetry` in the extension/service-worker network logs.
8. In Supabase, verify one row each for `extension_open`, `currency_change`, `watchlist_change` and `price_load`, with no asset IDs, emails, URLs or tokens in `properties`.
9. Verify duplicate delivery of the same `event_id` does not create a second row.
10. Check GA4 Realtime/debug reporting only after confirming the Supabase rows exist.
