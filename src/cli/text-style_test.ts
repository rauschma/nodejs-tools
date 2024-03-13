import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import { style } from '@rauschma/nodejs-tools/cli/text-style.js';
import assert from 'node:assert/strict';

createSuite(import.meta.url);

test('Style as template tag', () => {
  assert.equal(
    style.Underline.FgGreen`underlined green`,
    '\x1B[4;32munderlined green\x1B[39;24m'
  );
  assert.equal(
    style.FgColorCode(51)`turquoise`,
    '\u001b[38;5;51mturquoise\u001b[39m'
  );
});

test('Style as function', () => {
  assert.equal(
    style.Underline.FgGreen('underlined green'),
    '\x1B[4;32munderlined green\x1B[39;24m'
  );
  assert.equal(
    style.FgColorCode(51)('turquoise'),
    '\u001b[38;5;51mturquoise\u001b[39m'
  );
});

test('Nested styles', () => {
  assert.equal(
    style.Bold`bold before ${style.Italic`italics`} and after`,
    '\x1B[1mbold before \x1B[3mitalics\x1B[23m and after\x1B[22m'
  );
});
