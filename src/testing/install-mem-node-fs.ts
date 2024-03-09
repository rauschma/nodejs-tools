/**
 * Patches `node:fs` so that it uses an in-memory file system.
 * Module `dir-json_test.ts` shows this module in action.
 * 
 * ```js
 * // 1. Static imports: modules that don’t use `node:fs`
 * import assert from 'node:assert/strict';
 * 
 * // 2. Patch `node:fs`
 * import { mfs } from '@rauschma/nodejs-tools/install-mem-node-fs.js';
 * 
 * // 3. Dynamic imports: modules that should access the patched `node:fs`
 * const { readFromDisk } = await import('./file-tools.js');
 * ```
 * @module
 */

import { fs as mfs } from 'memfs';
import quibble from 'quibble';
await quibble.esm('node:fs', mfs);

export {mfs};