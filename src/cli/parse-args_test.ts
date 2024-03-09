import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import assert from 'node:assert/strict';
import { parseSubcommand } from './parse-args.js';

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
