# Voka Plus launch plan

Audit date: 24 September 2026. Status: **not live**. This document records the
implementation and owner decisions needed before accepting subscription payments.
It does not activate a store product, change an AI allowance, or approve a price.

## Recommended first launch

Launch Android subscriptions through Google Play Billing, using the RevenueCat
SDK already installed in Voka. Pakistan supports both developer and merchant
registration. Google lists PKR as the developer default currency, with a separate
payout-currency footnote; confirm the actual bank and payout configuration in the
owner's payments profile. [Supported locations](https://support.google.com/googleplay/android-developer/answer/9306917?hl=en).

Subscriptions unlocking digital features in a Play-distributed app generally
require Play Billing unless an applicable policy exception is satisfied. A
direct-download APK and website checkout are a separate launch route, not an
automatic substitute for Play Billing. [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).

Google's Pakistan payment-method page lists supported cards. Do not advertise
JazzCash or Easypaisa availability without verifying the actual checkout and
provider support. [Pakistan payment methods](https://support.google.com/googleplay/answer/2651410?co=GENIE.CountryCode%3DPK&hl=en).

## Current implementation

The list below is the initial audit. The code implementation was subsequently added;
see [implementation and setup](subscriptions.md) for the current behavior and tests.
The owner has confirmed neither store nor RevenueCat account is set up yet. No live
products, prices, payments or remote backend changes have been activated.

- Android application ID: `com.asjadali.voka`.
- `react-native-purchases` is installed. `src/features/subscription/billing.ts`
  implements basic customer lookup, purchase and restore calls.
- The intended RevenueCat entitlement identifier is `voka_plus`.
- `src/app/plus.tsx` has an authenticated paywall, but its benefits and purchase
  states are not ready for a paid launch.
- `src/app/profile.tsx` advertises a planned Rs 200/month price and unlimited
  practice. Neither is an approved, costed live offer.
- The inspected local configuration has no RevenueCat keys. Remote account and
  store-product readiness have not been established.
- `supabase/functions/realtime-session/index.ts` and the AI-budget SQL do not
  authorize paid access using server-verified subscription entitlements.
- Existing pilot request limits and voice-session leases are safeguards, not a
  defined subscription allowance or a guaranteed monetary spending cap.

## Owner decisions and account prerequisites

- [ ] Confirm Google Play first, direct APK/website, or both.
- [ ] Confirm Play developer account, payments-profile verification and RevenueCat
      project status. Provide status and non-secret identifiers, not passwords.
- [ ] Approve the monthly price, included voice allowance, assessment allowance,
      reset period, free-tier boundaries and behavior after exhaustion.
- [ ] Complete identity/business verification, bank/tax details and agreements
      directly in the providers' secure dashboards.
- [ ] Supply the business/support contact and public privacy/terms URLs. Have the
      owner confirm applicable business and tax requirements before launch.
- [ ] Approve any registration fees or paid provider-plan changes separately.

Do not launch an unlimited paid AI promise. The current voice model is
`gpt-realtime-2.1`, with audio input/output token charges; transcription uses
`gpt-live-transcribe`, with separate usage charges. Cost a finite allowance using
measured sessions, conversation context, assessments, hosting, store fees and
currency conversion. Do not silently change model quality to fit a price.
[Realtime pricing](https://developers.openai.com/api/docs/models/gpt-realtime-2.1),
[transcription pricing](https://developers.openai.com/api/docs/models/gpt-live-transcribe),
[voice cost accounting](https://developers.openai.com/api/docs/guides/voice-latency-cost?voice-api=realtime).

## Implementation sequence after those decisions

1. Create the approved store subscription/base plan and connect its product to
   RevenueCat's `voka_plus` entitlement and current offering. Keep sandbox and
   production credentials, products and grant behavior distinct.
2. Add server-owned entitlement storage and reconciliation. Authenticate incoming
   webhooks, handle duplicate/out-of-order delivery, and query authoritative
   provider state. Map purchases only to authenticated Voka user IDs. Client
   flags must never grant paid AI access. Sandbox purchases must not grant
   production allowances. Add recovery for missed webhooks and provider outages.
3. Enforce the approved allowance atomically in the backend, with a defined
   billing-period reset and bounded session duration. Retain global provider-cost
   controls. Decide renewal, cancellation, expiry, refund, revocation, payment
   failure and grace-period behavior explicitly.
4. Harden the client: serialize SDK identity changes and purchases, clear stale
   offerings on account changes, restrict the selectable package to the approved
   product, and distinguish cancellation, pending payment, failure and success.
   Show the localized price and period, actual benefits, remaining allowance,
   retry, restore, and reliable subscription-management navigation. Do not claim
   access is ready until backend entitlement synchronization succeeds.
5. Keep purchase controls unavailable until both store configuration and backend
   enforcement are ready. Never embed RevenueCat secret REST keys, webhook
   credentials, store service-account credentials or AI keys in the app or OTA.
   Only platform-specific public RevenueCat SDK keys belong in public app config.
6. Build and distribute through the chosen store test track, verify real test
   purchases, then complete production review. An OTA can update compatible UI
   code, but it cannot replace store setup, purchase testing or approval.

RevenueCat recommends authoritative subscriber lookup when processing webhook
events and documents retries, authentication and sandbox identification. Confirm
feature/plan access before relying on it. [Webhook documentation](https://www.revenuecat.com/docs/integrations/webhooks).

## Release acceptance checks

- [ ] Successful purchase grants the correct allowance once, including delayed
      webhook or app restart during checkout.
- [ ] Cancelled, failed and pending purchases do not grant access or show success.
- [ ] Restore/reinstall, account switching and device switching do not transfer
      another Voka account's allowance accidentally.
- [ ] Renewal, cancellation through period end, expiry, refund, revocation and
      payment failure match both store state and the displayed entitlement.
- [ ] Duplicate/replayed webhooks, forged client requests, concurrent quota use,
      stale events and sandbox events cannot create production credits.
- [ ] Offline/provider failure, quota exhaustion and global safety limits show
      actionable messages without opening bypasses or misleading purchase offers.
- [ ] Account deletion explains separate store cancellation and the owner has
      approved financial-record retention and support procedures.
- [ ] The paywall, profile promotion, store listing and terms describe the same
      approved price model and benefits; no unimplemented unlimited promises.
- [ ] A physical-device store test purchase, restore and cancellation pass before
      production sales are enabled.

New personal Play accounts may require at least 12 opted-in closed-test users for
14 continuous days before applying for production access. Account-specific
requirements and store approval cannot be replaced by an APK or OTA publish.
[Google Play testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
