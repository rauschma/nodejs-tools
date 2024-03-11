import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import { style } from '@rauschma/nodejs-tools/cli/text-style.js';
import assert from 'node:assert/strict';

createSuite(import.meta.url);

test('style as template tag', () => {
  assert.equal(
    style.Underline.FgGreen`underlined green`,
    '\x1B[4;32m' + 'underlined green' + '\x1B[0m'
  );
  assert.equal(
    style.FgColorCode(51)`turquoise`,
    '\x1B[38;5;51m' + 'turquoise' + '\x1B[0m'
  );
});

test('style as function', () => {
  assert.equal(
    style.Bold('bold'),
    '\x1B[1m' + 'bold' + '\x1B[0m'
  );
  assert.equal(
    style.FgColorCode(51)('turquoise'),
    '\x1B[38;5;51m' + 'turquoise' + '\x1B[0m'
  );
});
