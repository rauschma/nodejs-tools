import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import assert from 'node:assert/strict';

// - Only dynamically imported modules use the patched `node:fs`!
// - In other words: We must use dynamic `import()` after the following
//   static `import` installed the patch.
import { mfs } from './install-mem-node-fs.js';
const { dirToJson, jsonToCleanDir } = await import('@rauschma/nodejs-tools/testing/dir-json.js');

createSuite(import.meta.url);

test('jsonToCleanDir() & dirToJson(): directories with text files', () => {
  jsonToCleanDir(mfs, {
    '/tmp/test/': {
      'dir': {
        'file1.txt': 'content1\n',
      },
      'file2.txt': 'content2\n',
    },
  });

  assert.deepEqual(
    dirToJson('/tmp/test/'),
    {
      dir: {
        'file1.txt': 'content1\n'
      },
      'file2.txt': 'content2\n',
    }
  );
  assert.deepEqual(
    dirToJson('/tmp/test/', { trimEndsOfFiles: true }),
    {
      dir: {
        'file1.txt': 'content1'
      },
      'file2.txt': 'content2',
    }
  );
});

test('jsonToCleanDir() & dirToJson(): empty directories', () => {
  jsonToCleanDir(mfs, {
    '/tmp/empty-dir/': {},
  });
  assert.ok(mfs.existsSync('/tmp/empty-dir/'));
  assert.deepEqual(
    dirToJson('/tmp/'),
    {
      'empty-dir': {},
    }
  );
});
