import type { IFs } from 'memfs';
import type { Volume } from 'memfs/lib/volume.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

//#################### Write to the file system ####################
// - The file system is only a parameter for safety reasons – so that we
//   don’t accidentally change the real file system.

/**
 * This function should only be called with a patched `node:fs`. It only
 * has the memory file system as a parameter to ensure that we never
 * accidentally mess up the real file system.
 */
export function jsonToCleanDir(mfs: IFs, dirJson: DirJson): void {
  (mfs as unknown as {__vol: Volume}).__vol.reset();
  jsonToDir(mfs, dirJson);
}

export function jsonToDir(mfs: IFs, dirJson: DirJson): void {
  for (const [rootDirPath, rootDirJson] of Object.entries(dirJson)) {
    createDirRec(rootDirPath, rootDirJson);
  }
  function createDirRec(parentAbsPath: string, childrenJson: string | DirJson) {
    if (typeof childrenJson === 'string') {
      // File
      ensureParentDirectoryMem(mfs, parentAbsPath);
      mfs.writeFileSync(parentAbsPath, childrenJson, {encoding: 'utf-8'});
    } else {
      // Directory
      mfs.mkdirSync(parentAbsPath, {recursive: true})
      for (const [childRelPath, childJson] of Object.entries(childrenJson)) {
        if (path.isAbsolute(childRelPath)) {
          throw new Error('Child directories must be relative: ' + childRelPath);
        }
        const childAbsPath = path.join(parentAbsPath, childRelPath);
        if (typeof childJson === 'string') {
          // File
          ensureParentDirectoryMem(mfs, childAbsPath);
          mfs.writeFileSync(childAbsPath, childJson, {encoding: 'utf-8'});
        } else {
          // Directory
          mfs.mkdirSync(childAbsPath, {recursive: true});
          createDirRec(childAbsPath, childJson);
        }
      }
    }
  }
}

export function ensureParentDirectoryMem(mfs: IFs, filePath: string) {
  const parentDir = path.dirname(filePath);
  if (!mfs.existsSync(parentDir)) {
    mfs.mkdirSync(parentDir, { recursive: true });
  }
}

//#################### Read from the file system ####################

export type DirJson = {
  [key: string]: string | DirJson;
};
type DirToJsonOptions = {
  trimEndsOfFiles?: boolean,
};
export function dirToJson(dirPath: string, options: DirToJsonOptions = {}): DirJson {
  const trimEndOfFiles = options.trimEndsOfFiles ?? false;
  const dirJson: DirJson = {};
  const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true }) as unknown as Array<fs.Dirent>;
  // Sort the entries to keep things more deterministic
  dirEntries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  for (const dirEntry of dirEntries) {
    const fileName = dirEntry.name;
    const pathName = path.join(dirPath, fileName);
    if (dirEntry.isDirectory()) {
      dirJson[fileName] = dirToJson(pathName, options);
    } else if (dirEntry.isFile()) {
      let content = fs.readFileSync(pathName, 'utf-8') as string;
      if (trimEndOfFiles) {
        content = content.trimEnd();
      }
      dirJson[fileName] = content;
    }
  }
  return dirJson;
}
