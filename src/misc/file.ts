import { UnsupportedValueError } from '@rauschma/helpers/typescript/error.js';
import { type PropertyValues } from '@rauschma/helpers/typescript/type.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function ensureParentDirectory(filePath: string) {
  const parentDir = path.dirname(filePath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
}

export const MissingDirectoryMode = {
  Error: 'Error',
  Create: 'Create',
  Ignore: 'Ignore',
} as const;
export type MissingDirectoryModeType = PropertyValues<typeof MissingDirectoryMode>;

/**
 * Remove the contents of `dir`, but not the directory itself.
 */
export function clearDirectorySync(dir: string, mode: MissingDirectoryModeType = MissingDirectoryMode.Error) {
  if (!fs.existsSync(dir)) {
    switch (mode) {
      case MissingDirectoryMode.Error:
        throw new Error('Directory does not exist: ' + dir);
      case MissingDirectoryMode.Create:
        fs.mkdirSync(dir, { recursive: true });
        return;
      case MissingDirectoryMode.Ignore:
        return;
      default:
        throw new UnsupportedValueError(mode);
    }
  } else {
    for (const fileName of fs.readdirSync(dir)) {
      const filePath = path.resolve(dir, fileName);
      fs.rmSync(filePath, { recursive: true });
    }
  }
}
