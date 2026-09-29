// Builds the public legal pages required by Google Play (privacy policy URL and account
// deletion URL) and the landing page from the same source as the in-app screens. Output: store/web/
// Usage: node --no-warnings scripts/build-legal-pages.mjs
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { documents, SUPPORT_EMAIL } = await import(join(root, 'src/features/legal/documents.ts'));
const out = join(root, 'store/web');
mkdirSync(out, { recursive: true });

const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Public site. Search engines use the canonical URLs, descriptions and structured data below.
const SITE = 'https://vokeno.com';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.asjadali.voka';
const DESCRIPTION =
  'Practise speaking English and German with a friendly AI coach. IELTS-style speaking practice, German from A0 to B1, pronunciation help and daily review.';

const page = (title, body, { path, description = DESCRIPTION, jsonLd } = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${SITE}/${path}">
<link rel="icon" href="icon.png">
<meta name="theme-color" content="#131211">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vokeno">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${SITE}/${path}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
<style>
  :root { --ink: #131211; --cream: #f1ede3; --muted: #5f5b58; --yellow: #f2b705; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--cream); color: var(--ink);
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
  .brand { font-weight: 800; letter-spacing: -0.5px; font-size: 22px; text-decoration: none; }
  h1 { font-size: 32px; line-height: 1.15; margin: 24px 0 4px; }
  h2 { font-size: 19px; margin: 28px 0 6px; }
  p, li { color: var(--muted); }
  .card { background: #fff; border-radius: 18px; padding: 18px 20px; margin: 20px 0; }
  .cta { display: inline-block; background: var(--yellow); color: var(--ink); font-weight: 700;
    border-radius: 14px; padding: 14px 22px; text-decoration: none; margin: 8px 0; }
  .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .grid .card { margin: 0; }
  .grid h3 { margin: 0 0 4px; font-size: 17px; }
  .grid p { margin: 0; }
  a { color: var(--ink); }
  nav a { margin-right: 16px; }
</style>
</head>
<body><main>
<a class="brand" href="./">VOKENO</a>
${body}
<nav><p><a href="./">Home</a><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms of use</a><a href="delete-account.html">Delete your account</a></p></nav>
</main></body>
</html>
`;

const legal = (doc, path) =>
  page(
    `${doc.title} · Vokeno`,
    `<h1>${escape(doc.title)}</h1><p>${escape(doc.intro)}</p>` +
      doc.sections.map(([h, t]) => `<h2>${escape(h)}</h2><p>${escape(t)}</p>`).join(''),
    { path, description: `${doc.title} for Vokeno, the AI speaking coach for English and German.` },
  );

writeFileSync(join(out, 'privacy.html'), legal(documents.privacy, 'privacy.html'));
writeFileSync(join(out, 'terms.html'), legal(documents.terms, 'terms.html'));
writeFileSync(
  join(out, 'delete-account.html'),
  page(
    'Delete your Vokeno account',
    `<h1>Delete your Vokeno account</h1>
<p>You can delete your account and its synced learning data at any time.</p>
<div class="card"><h2>In the app</h2><ol>
<li>Open Vokeno and go to <strong>Profile</strong>.</li>
<li>Tap <strong>Delete account</strong> and confirm.</li>
</ol><p>Deletion is immediate and cannot be undone.</p></div>
<div class="card"><h2>By email</h2><p>If you cannot open the app, email <a href="mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Voka%20account">${SUPPORT_EMAIL}</a> from the address you signed up with and ask us to delete your account. We complete requests within 30 days.</p></div>
<h2>What is deleted</h2><p>Your account, synced learning progress, saved writing and feedback, assessments, usage records and any reports you filed about AI responses. Records held by Google Play and RevenueCat about purchases are kept by those providers under their own policies.</p>
<h2>Subscriptions</h2><p>Deleting your account does not cancel a Google Play subscription. Cancel it first in Vokeno Plus or in Google Play &gt; Payments &amp; subscriptions.</p>`,
    {
      path: 'delete-account.html',
      description: 'How to delete your Vokeno account and learning data, in the app or by email.',
    },
  ),
);
const features = [
  [
    'Real conversations',
    'Talk out loud with an AI coach that answers in a natural voice and lets you interrupt.',
  ],
  [
    'IELTS-style speaking',
    'Timed Part 1, 2 and 3 practice with feedback on fluency, vocabulary, grammar and pronunciation.',
  ],
  [
    'German from zero to B1',
    'Step-by-step lessons for everyday situations, from greetings to work and travel.',
  ],
  [
    'Clear pronunciation',
    'Focus on being understood: rhythm, stress and the sounds that matter most.',
  ],
  [
    'Writing feedback',
    'Short writing tasks with instant, specific corrections you can learn from.',
  ],
  ['Smart review', 'Words and phrases come back just before you forget them.'],
];
writeFileSync(
  join(out, 'index.html'),
  page(
    'Vokeno: AI speaking coach for English and German',
    `<h1>Speak English and German with confidence</h1>
<p>Vokeno is an AI speaking coach. Practise real conversations out loud, prepare for IELTS-style speaking tests and learn German from zero to B1, a few minutes a day.</p>
<a class="cta" href="${PLAY_URL}">Get it on Google Play</a>
<div class="grid">${features
      .map(([h, t]) => `<div class="card"><h3>${escape(h)}</h3><p>${escape(t)}</p></div>`)
      .join('')}</div>
<h2>Free to start</h2>
<p>Lessons, review and placement are free. Live AI practice includes a free daily allowance, and Vokeno Plus adds more for a small monthly price shown in Google Play.</p>
<h2>Honest by design</h2>
<p>Vokeno is independent of IELTS and does not award official band scores or certificates. AI feedback can be wrong, and you can report any response in the app.</p>
<h2>Contact</h2>
<p><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>`,
    {
      path: '',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'MobileApplication',
        name: 'Vokeno',
        operatingSystem: 'Android',
        applicationCategory: 'EducationalApplication',
        description: DESCRIPTION,
        url: SITE,
        installUrl: PLAY_URL,
        image: `${SITE}/icon.png`,
        inLanguage: ['en', 'de'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  ),
);
copyFileSync(join(root, 'assets/images/icon.png'), join(out, 'icon.png'));
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    '',
    'privacy.html',
    'terms.html',
    'delete-account.html',
  ]
    .map((path) => `  <url><loc>${SITE}/${path}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(
  'Wrote',
  [
    'index.html',
    'privacy.html',
    'terms.html',
    'delete-account.html',
    'robots.txt',
    'sitemap.xml',
    'icon.png',
  ]
    .map((n) => `store/web/${n}`)
    .join(', '),
);
