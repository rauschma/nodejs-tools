import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import { parseSubcommand } from '@rauschma/nodejs-tools/cli/parse-args.js';
import assert from 'node:assert/strict';

createSuite(import.meta.url);

test('parseSubcommand', () => {
  const cmdOptions = {
    log: {
      type: 'string',
    },
  } as const;
  const subcmdOptions = {
    color: {
      type: 'boolean',
    },
  } as const;
  const args = ['--log', 'all', 'print', '--color', 'file.txt'];
  const result = parseSubcommand(
    { options: cmdOptions },
    { options: subcmdOptions, allowPositionals: true },
    args
  );

  const pn = (obj: object) => Object.setPrototypeOf(obj, null);
  assert.deepEqual(
    result,
    {
      commandResult: {
        values: pn({ 'log': 'all' }),
        positionals: []
      },
      subcommandName: 'print',
      subcommandResult: {
        values: pn({ color: true }),
        positionals: ['file.txt']
      }
    }
  );
});
