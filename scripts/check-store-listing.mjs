// Verifies the Google Play listing copy in store/listing/README.md against Play's limits.
// Usage: node scripts/check-store-listing.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const text = readFileSync(join(root, 'store/listing/README.md'), 'utf8');
const LIMITS = { Title: 30, 'Short description': 80, 'Full description': 4000 };
const BANNED = /\b(best|#1|top|free download|guaranteed|certified)\b/i;

let failed = false;
for (const [, locale, body] of text.matchAll(
  /<!-- listing:([\w-]+) -->([\s\S]*?)(?=<!-- listing:|$)/g,
)) {
  for (const [field, limit] of Object.entries(LIMITS)) {
    const match = body.match(
      new RegExp(`\\*\\*${field}\\*\\*\\s*\`\`\`text\\n([\\s\\S]*?)\\n\`\`\``),
    );
    if (!match) {
      console.error(`${locale}: missing ${field}`);
      failed = true;
      continue;
    }
    // Play counts Unicode characters, not bytes.
    const length = [...match[1]].length;
    const banned = field === 'Title' && BANNED.test(match[1]);
    const ok = length <= limit && !banned;
    if (!ok) failed = true;
    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${locale} ${field}: ${length}/${limit}${banned ? ' (banned word)' : ''}`,
    );
  }
}
process.exit(failed ? 1 : 0);
