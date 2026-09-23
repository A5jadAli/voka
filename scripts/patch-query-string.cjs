// Expo Router 57 uses import * as queryString (the v7 API).
// v9.5.1 fixes malformed-URI DoS but its entrypoint exposes only a default export.
// Also expose the existing named functions without changing their implementation.
const fs = require('node:fs');
const path = require('node:path');
const entry = require.resolve('query-string');
const version = JSON.parse(
  fs.readFileSync(path.join(path.dirname(entry), 'package.json'), 'utf8'),
).version;
if (version !== '9.5.1')
  throw new Error('Review query-string compatibility before changing its pinned version.');
const content = fs.readFileSync(entry, 'utf8');
const namedExports = "export * from './base.js';";
if (!content.includes(namedExports)) {
  if (!content.includes('export default queryString;'))
    throw new Error('Unexpected query-string entrypoint.');
  fs.writeFileSync(entry, `${content}\n${namedExports}\n`);
}
