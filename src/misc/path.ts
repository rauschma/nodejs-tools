const {stringify} = JSON;

// ❌ FIXME – alternative: removeFilePathExtension()

/**
 * @param sourceExt Example: `'.md'`
 * @param targetExt Example: `'.html'`
 */
export function replaceFilePathExtension(filePath: string, sourceExt: string, targetExt: string): string {
  if (filePath.endsWith(sourceExt)) {
    return filePath.slice(0, -sourceExt.length) + targetExt;;
  }
  throw new Error(`Web path ${stringify(filePath)} does not have the filename extension ${stringify(sourceExt)}`);
}
