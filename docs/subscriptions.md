# Subscription implementation and setup

Status: code implemented and deployed to the Voka preview backend on 24 September
2026, with **billing and sales disabled**. The Android client is published to the
preview OTA channel. No real purchase can be verified until store setup is complete.
Local test prices and limits are synthetic fixtures, not an approved Voka offer.
See [preview release verification](subscription-preview-release.md).

## Implemented behavior

- An authenticated Plus screen displays the store-localized monthly price and
  server-configured finite daily allowance. Guests are directed to account creation.
- Checkout uses only the configured monthly product. Android buys the displayed
  full-price auto-renewing base plan, not an arbitrary offer. Annual, lifetime and
  prepaid plans are intentionally not supported by this first implementation.
- Purchase/restore operations and SDK identity changes are serialized. Duplicate
  actions are blocked and authentication is checked again after asynchronous work.
- Cancellation, pending payment, unconfirmed purchase, empty restore, expired
  access and store/network failures have distinct feedback. Pending confirmation
  refreshes automatically for a bounded time and always offers manual refresh.
- The app never grants paid AI access from a local `isPlus` flag. Backend REST v1
  lookup verifies `voka_plus`, product, store, environment, expiry, refund status
  and the authenticated Voka user ID.
- Backend state is cached for at most five minutes, bounded by the subscription
  expiry. App refresh, purchase/restore and authenticated webhook notifications
  reconcile canonical state. Provider failures do not overwrite valid state.
  Free practice remains available under its existing limits; stale paid state
  cannot grant extra requests. Provider notification delays may add latency.
- Cancellation retains access until expiry. Explicit provider grace dates are
  honored; refunds, revoked/expired entitlements and invalid products do not
  qualify. Webhook arrival order does not overwrite a newer canonical snapshot.
- Request usage is atomic and server-only. Restores, renewals, repeated webhooks
  and account switches never refill a day's usage. UTC midnight resets the daily
  allowance, separately from the monthly billing period. Paid limits are total
  daily limits, not additional credits on top of free usage. Request attempts
  count once admitted for processing, even if a downstream call fails.
- Existing five-minute voice leases, cleanup heartbeat and global request caps
  remain enforced. These caps are not a currency spending guarantee.
- Safe store-management links remain available even without new sales. No
  arbitrary URL supplied by an event or customer is opened.

## Owner-controlled setup

1. Complete the Play developer/payments profile and RevenueCat project. Approve
   the price and daily limits before creating a live offer. The former Rs 200 and
   unlimited promises have been removed, not replaced with an assumed price.
2. Upload a billing-enabled Android build for `com.asjadali.voka` to the appropriate
   Play test track. Create an auto-renewing monthly subscription and base plan.
   Connect the Play app/service credentials and real-time developer notifications
   to RevenueCat, following its current store-integration instructions.
3. Create entitlement `voka_plus`, attach the product, and put it in the current
   offering's monthly package. A proposed naming convention is subscription
   `voka_plus`, base plan `monthly`, RevenueCat product `voka_plus:monthly`.
   Configure the actual identifiers, not this example, in the backend.
4. Set RevenueCat restore behavior to **Keep with original App User ID**. This
   implementation uses authenticated Supabase UUIDs only, never anonymous SDK
   identities. Restores require the original Voka account. Automatic transfers
   or sharing across Voka accounts are not supported. Do not change that policy
   without implementing and testing an explicit ownership-transfer flow.
5. Add only public `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` / iOS SDK keys to the
   corresponding EAS environment. Production keys use the actual store app, not
   a RevenueCat Test Store. Test Store receipts cannot grant paid AI access.
6. Store these values in **Supabase Edge Function secrets**, not Git, public
   environment variables, command-line arguments or chat:
   - `REVENUECAT_SECRET_API_KEY`: project REST v1 secret API key.
   - `REVENUECAT_WEBHOOK_AUTH`: a strong random full Authorization-header value
     of at least 32 characters, configured identically in RevenueCat.
   - `REVENUECAT_WEBHOOK_SIGNING_SECRET`: integration HMAC signing secret.
7. Register webhook URL
   `https://<project>.supabase.co/functions/v1/revenuecat-webhook`. Enable HMAC
   signing. Supabase JWT verification is intentionally off only for this webhook;
   the function requires both its own Authorization header and a valid raw-body
   signature with a five-minute delivery timestamp tolerance. Failed processing
   returns a retryable status. Never disable these checks to make a test pass.

Use a separate staging Supabase project and store license testers for sandbox
purchases. Set its configuration environment to `SANDBOX`. Production uses
`PRODUCTION` and rejects sandbox receipts. Do not turn the production database
into a sandbox to test purchases.

## Deploy and configure, with sales still disabled

After reviewing the target project and migrations:

```bash
npx supabase db push
npx supabase functions deploy subscription-status revenuecat-webhook realtime-session
```

Migration `20260924000000_subscriptions.sql` starts with `enabled = false`,
`sales_enabled = false`, empty product IDs and zero paid allowances. Database
access is restricted to the service role; do not grant clients write privileges.

The owner-approved configuration belongs in the singleton row of
`public.voka_subscription_config`:

| Field              | Meaning                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| `enabled`          | Enables verified subscription access. Keep false until setup is valid. |
| `sales_enabled`    | Allows new checkout independently of existing subscribers.             |
| `environment`      | `PRODUCTION` or staging-only `SANDBOX`.                                |
| `android_product`  | Exact RevenueCat subscription/base-plan ID.                            |
| `ios_product`      | Exact monthly iOS product, or empty if not launching iOS.              |
| `voice_daily`      | Approved total daily session-start allowance.                          |
| `assessment_daily` | Approved total daily assessment-request allowance.                     |

Paid limits should exceed free allowances and fit the separately reviewed global
caps in `voka_ai_budget_config`. New sales are suppressed if voice limits do not
exceed free limits, assessment limits are lower than free limits, global caps are
too small, or webhook credentials are missing. This is a safety check, not proof
of provider readiness, verified webhooks or commercial viability.

Keep the quota/model cost budget under operational review. Before changing a
live plan's benefits, product identifiers or price, review existing subscribers,
store requirements and customer communication. Do not shrink an advertised paid
allowance silently.

## Verification

```bash
npm run typecheck
npm run lint
npm run test:ci
bash scripts/test-subscriptions-db.sh
```

The database script creates an isolated synthetic PostgreSQL 16 cluster under
`/tmp`, never connects to a production database, and stops the cluster on exit.
Set `VOKA_TEST_PG_BIN` if PostgreSQL binaries are installed elsewhere.

Local verification on 24 September 2026: 113 unit tests and all 68 mobile-sized
browser checks passed, along with isolated database permission, expiry, replay
and concurrent paid-quota checks. TypeScript, lint, formatting, frozen Deno checks,
Expo Doctor (21 checks) and the production npm dependency audit also passed.
These are synthetic tests, not real store purchase verification.

Before enabling production sales, verify on a physical device using the store
test track: purchase, pending approval, cancellation, renewal, payment failure,
grace, expiry, refund/revocation, restore/reinstall, original-account ownership,
account switching during checkout, background/return, duplicate webhooks,
provider outages and quota exhaustion. Confirm a real provider response matches
the configured Android base-plan identifier. Test public Terms/Privacy URLs,
support contact and refund-support procedure. Store approval and owner business
verification are separate from code completion.

## Operational controls

- Set `sales_enabled = false` to stop new checkout while honoring existing paid
  access. Do not use `enabled = false` as the normal sales pause.
- If webhook delivery fails, inspect provider delivery status without logging
  bodies, tokens or credentials. Canonical reads on app/AI use provide recovery.
- Five-minute entitlement freshness and ten-second per-user reconciliation
  throttling bound stale state and lookup load. Retry failed webhook deliveries;
  do not acknowledge skipped work as successfully synchronized.
- Account deletion cascades the Voka entitlement row. It does not cancel the
  external store subscription. The account-deletion warning explains continued
  billing and that purchases cannot be restored to a newly created Voka account;
  provider financial records and their retention remain separate.
- The test suite does not replace an actual store receipt, store review or
  production monitoring. Do not advertise subscriptions as live until those pass.

Primary integration references:
[RevenueCat customer API](https://www.revenuecat.com/docs/api-v1/customers),
[webhook authentication and delivery](https://www.revenuecat.com/docs/integrations/webhooks),
[Google Play product IDs](https://www.revenuecat.com/docs/getting-started/entitlements/android-products),
[customer identity](https://www.revenuecat.com/docs/customers/identifying-customers).
