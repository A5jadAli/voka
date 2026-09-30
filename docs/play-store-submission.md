# Google Play submission guide

Status as of 30 September 2026. Items marked **Done** are implemented and verified in code or on the backend; **Owner** items need Play Console access or a decision only the owner can make.

## 1. Payments (the most common rejection cause)

| Item                                                                                    | Status                  |
| --------------------------------------------------------------------------------------- | ----------------------- |
| Subscriptions sold only through **Google Play Billing** (via RevenueCat)                | Done                    |
| No in-app JazzCash / Easypaisa / card checkout and no links steering to outside payment | Done (keep it this way) |
| Price shown comes from Google Play, in the user's currency                              | Done                    |
| Auto-renewal, cancellation, restore and manage-subscription disclosures on the paywall  | Done                    |
| Terms and privacy links on the paywall                                                  | Done                    |

**Why not JazzCash or Easypaisa in the app:** Google's Payments policy requires Play Billing for digital subscriptions. Alternative (user-choice) billing is available only in Australia, Brazil, the EEA, India, Indonesia, Japan, South Africa, South Korea, the UK and the US, not Pakistan. Pakistani users can still pay on Play with Visa/Mastercard (including JazzCash and Easypaisa debit cards) and Jazz carrier billing.

**Owner: create the subscription**

1. Play Console > Monetize > Subscriptions > create `voka_plus`, base plan `monthly`, auto-renewing, 1 month.
2. Base price **US$1.00**. Set Pakistan to a round local price (suggested **Rs 280**; Play converts automatically if you prefer). Google keeps a 15% service fee on subscriptions.
3. Follow `docs/subscriptions.md` to connect RevenueCat and turn `sales_enabled` on only after a test purchase succeeds on the internal test track.

## 2. Policies checked in the app

| Requirement                                                                                                            | Status                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| AI-generated content: in-app **Report** on the live coach, writing feedback and assessments (no need to leave the app) | Done; reports stored in `ai_content_reports`, readable only with the service role |
| AI disclosure: coach and feedback labelled as AI and "can be wrong"                                                    | Done                                                                              |
| Account deletion inside the app (Profile > Delete account)                                                             | Done                                                                              |
| Account deletion web page                                                                                              | Page built: `store/web/delete-account.html`. **Owner:** host it (see section 6)   |
| Privacy policy in the app and on the web                                                                               | Page built: `store/web/privacy.html`. **Owner:** host it                          |
| Privacy contact `support@vokeno.com`                                                                                   | **Owner:** buy vokeno.com and set up this mailbox (section 4)                     |
| Microphone used only in the foreground after a tap, with permission explained                                          | Done                                                                              |
| No unused sensitive permissions (camera, storage, overlay, biometrics blocked)                                         | Done from the next build                                                          |
| Target API level 36                                                                                                    | Done                                                                              |
| 16 KB page-size alignment of all native libraries                                                                      | Done: 25/25 libraries verified on build 14                                        |

## 3. Play Console forms (owner)

**Target audience and content:** 13+. Do not opt into the Families programme; an AI chat app is not suitable for children under 13. Complete the content rating questionnaire truthfully: user-to-AI chat, no user-to-user communication, no gambling or violence.

**Data safety (draft answers):**

| Data type                                                    | Collected                   | Shared                                    | Purpose                   | Notes                                         |
| ------------------------------------------------------------ | --------------------------- | ----------------------------------------- | ------------------------- | --------------------------------------------- |
| Email address, name                                          | Yes (accounts)              | No                                        | Account management        | Optional: guests can learn without an account |
| Voice or sound recordings                                    | Yes, processed in real time | Yes, with OpenAI as service provider      | App functionality         | Not stored by Vokeno                          |
| Other user-generated content (writing, transcripts, reports) | Yes                         | Yes, with xAI/OpenAI as service providers | App functionality, safety | Deleted with the account                      |
| App activity (learning progress)                             | Yes                         | No                                        | App functionality         | Synced to the account                         |
| Purchase history                                             | Yes                         | Yes, with RevenueCat                      | Subscriptions             |                                               |
| User IDs                                                     | Yes                         | Yes, with RevenueCat                      | Subscriptions             | Supabase account UUID                         |

Data is encrypted in transit; users can request deletion (in app and via the web page).

**App access for reviewers:** Vokeno works as a guest. Add review notes: "Lessons, review, placement and writing work without an account. Live voice needs network and microphone permission; AI features have a daily free allowance." If you enable any account-only feature, provide a test account.

**New personal developer account:** Google requires a **closed test with at least 12 testers for 14 continuous days** before you can apply for production. Start the closed test early.

## 4. Name, domain and email (owner, do first)

**Why the app is called Vokeno:** the original name "Voka" collided with three AI language-learning apps by another developer on Google Play ("Voka – AI Language Tutor", `com.joapp.voca`) and with voka.app, a language-learning site. Play's impersonation policy forbids names confusingly similar to existing apps, and voka.com belongs to someone else. On 30 September 2026, vokeno.com and vokeno.app were unregistered, and no app on Google Play or the App Store used a similar name.

1. **Buy vokeno.com now** (about US$10–12 a year). Domain availability can change at any time. Optionally buy vokeno.app too.
2. Run a free trademark search for "Vokeno" at the [WIPO Global Brand Database](https://branddb.wipo.int) and IPO Pakistan before spending on branding.
3. Set up **support@vokeno.com** (for example free email forwarding from your registrar or Cloudflare to an inbox you read). It appears in the app, the privacy policy and the Play listing.
4. **Set up custom SMTP for sign-up emails.** Supabase's built-in email sender is limited to a few messages an hour and is meant for testing only, so real users would not receive their verification links. Use a provider such as Resend (free tier) with the vokeno.com domain, then enter its SMTP details in Supabase > Authentication > Emails > SMTP settings and set the sender to `Vokeno <no-reply@vokeno.com>`.

The package name stays `com.asjadali.voka`: users never see it except in the Play URL, and it is permanent after the first upload. Change it only before that first upload if you want it to match.

## 5. Turn on "Continue with Google" (owner, about 10 minutes)

The app already contains Google sign-in. The button appears automatically once the provider is enabled in Supabase, so nothing needs rebuilding.

1. Open [Google Cloud Console](https://console.cloud.google.com/), create a project named **Vokeno**, then go to **APIs & Services > OAuth consent screen** (Google Auth Platform). Choose **External**, app name **Vokeno**, your support email, and save. Under **Audience**, press **Publish app** so anyone can sign in (the basic email and profile scopes need no Google review).
2. Go to **Clients > Create client**. Application type **Web application**, name "Vokeno Supabase". Under **Authorized redirect URIs** add exactly:
   `https://feemunsltbbkkqyvorjn.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.
4. In [Supabase > Authentication > Sign In / Providers > Google](https://supabase.com/dashboard/project/feemunsltbbkkqyvorjn/auth/providers), switch **Enable Sign in with Google** on, paste the Client ID and Client secret, and save.
5. Open the app's sign-in screen: **Continue with Google** now shows above the email form.

Keep the client secret private: enter it only in the Supabase dashboard, never in the app or the repository. Guests who continue with Google keep their progress (their guest account is linked). Google's screen says "to continue to feemunsltbbkkqyvorjn.supabase.co" until you add a custom auth domain (a paid Supabase add-on); this is normal.

In the Play Console Data safety form, name and email are already declared, so Google sign-in needs no new entries.

## 6. Hosting the public pages (owner)

Run `node --no-warnings scripts/build-legal-pages.mjs`, then host the files in `store/web/` at **https://vokeno.com** (Cloudflare Pages, Netlify or GitHub Pages are free). The site is ready for search engines: every page has a description, canonical URL and share image (`og.png`), the home page has app structured data, and `robots.txt` and `sitemap.xml` are included. After it is live, add the site to [Google Search Console](https://search.google.com/search-console) and submit the sitemap.

- Privacy policy URL: `https://vokeno.com/privacy.html`
- Account deletion URL: `https://vokeno.com/delete-account.html`

The pages are generated from `src/features/legal/documents.ts`, the same source as the in-app screens, so rerun the script whenever the policy changes.

## 7. Store listing (ASO)

Copy-ready listings in English, Urdu and German, plus the hi-res icon and feature graphic, are in `store/listing/`. Run `node scripts/check-store-listing.mjs` after any edit to confirm Play's character limits. Add the Urdu and German translations under Play Console > Store presence > Main store listing > Manage translations.

Avoid claims Google or users could treat as misleading: no "certified", no "fluent in X days", no guaranteed IELTS band or CEFR level. Describe Vokeno as practice with AI feedback. Screenshots must show the real app.
