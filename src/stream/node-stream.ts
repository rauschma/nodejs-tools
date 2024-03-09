import * as stream from 'stream';

/**
 * Use `.push()` to add data chunks to instances of this class.
 */
export class SimpleReadable extends stream.Readable {
  override _read() {
    // do nothing
  }
  closeSimpleReadable() {
    this.push(null);
  }
}

export function stringToReadable(str: string): stream.Readable {
  const readable = new SimpleReadable();
  readable.push(str);
  readable.closeSimpleReadable();
  return readable;
}
