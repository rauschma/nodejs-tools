//#################### Producing streams ####################

/**
 * @param iterable an iterable (asynchronous or synchronous)
 * 
 * @see {@link https://github.com/whatwg/streams/pull/1083
 *      | Potential future alternative: `ReadableStream.from()`}
 * @see {@link https://streams.spec.whatwg.org/#example-rs-pull}
 */
export function iterableToReadableStream(iterable: AsyncIterable<string> | Iterable<string>): ReadableStream<string> {
  let iterator: null | AsyncIterator<string> | Iterator<string>;
  if (Symbol.asyncIterator in iterable && typeof iterable[Symbol.asyncIterator] === 'function') {
    iterator = iterable[Symbol.asyncIterator]();
  } else if (Symbol.iterator in iterable && typeof iterable[Symbol.iterator] === 'function') {
    iterator = iterable[Symbol.iterator]();
  } else {
    throw new Error('Not an iterable: ' + iterable);
  }
  return new ReadableStream<string>({
    async pull(controller) {
      if (iterator === null) return;
      const { value, done } = await iterator.next();
      if (done) {
        iterator = null;
        controller.close();
        return;
      }
      controller.enqueue(value);
    },
  });
}

//#################### Consuming streams ####################

export async function readableStreamToString(readableStream: ReadableStream<string>): Promise<string> {
  const reader = readableStream.getReader();
  try {
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return result;
      }
      result += value;
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=929585#c10
 */
export async function* readableStreamToAsyncIterable(readableStream: ReadableStream<string>) {
  const reader = readableStream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock()
  }
}

//#################### Transforming streams ####################

/**
 * Chunks to lines via TransformStream
 * @see https://streams.spec.whatwg.org/#example-ts-lipfuzz
 */
export class ChunksToLinesTransformer implements Transformer<string, string> {
  #previous = '';

  transform(chunk: string, controller: TransformStreamDefaultController<string>): void | PromiseLike<void> {
    let startSearch = this.#previous.length;
    this.#previous += chunk;
    while (true) {
      const eolIndex = this.#previous.indexOf('\n', startSearch);
      if (eolIndex < 0) break;
      // line includes the EOL
      const line = this.#previous.slice(0, eolIndex + 1);
      controller.enqueue(line);
      this.#previous = this.#previous.slice(eolIndex + 1);
      startSearch = 0;
    }
  }

  flush(controller: TransformStreamDefaultController<string>) {
    if (this.#previous.length > 0) {
      controller.enqueue(this.#previous);
    }
  }
}

export class ChunksToLinesStream extends TransformStream {
  constructor() {
    super(new ChunksToLinesTransformer());
  }
}

//#################### StringWritableStream ####################

export class StringWritableStream extends WritableStream {
  #string = '';
  constructor() {
    super({
      // We need to access the `this` of `StringWritableStream`. Hence the
      // arrow function (and not a method).
      write: (chunk) => {
        this.#string += chunk;
      },
    });
  }
  getString() {
    return this.#string;
  }
}
