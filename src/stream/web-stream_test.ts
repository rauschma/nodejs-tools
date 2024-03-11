import { arrayFromAsync } from '@rauschma/helpers/async/async-iteration.js';
import { createSuite } from '@rauschma/helpers/testing/mocha.js';
import { ChunksToLinesStream, iterableToReadableStream, readableStreamToAsyncIterable } from '@rauschma/nodejs-tools/stream/web-stream.js';
import assert from 'node:assert/strict';

createSuite(import.meta.url);

test('iterableToReadableStream', async () => {
  {
    async function* createAsyncIterable() {
      yield 'how';
      yield 'are';
      yield 'you';
    }
    const asyncIterable = createAsyncIterable();
    const stream = iterableToReadableStream(asyncIterable);
    assert.deepEqual(
      await arrayFromAsync(
        readableStreamToAsyncIterable(
          stream
        )
      ),
      [
        'how',
        'are',
        'you',
      ]
    );
  }
  {
    const syncIterable = ['hello', 'everyone'];
    const stream = iterableToReadableStream(syncIterable);
    assert.deepEqual(
      await arrayFromAsync(
        readableStreamToAsyncIterable(
          stream
        )
      ),
      [
        'hello',
        'everyone',
      ]
    );
  }
});

test('ChunksToLinesStream', async () => {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue('there\nare\nmany\nlines\nhere!');
      controller.close();
    },
  });
  const transformStream = new ChunksToLinesStream();
  const transformed = stream.pipeThrough(transformStream);

  assert.deepEqual(
    await arrayFromAsync(
      readableStreamToAsyncIterable(
        transformed
      )
    ),
    [
      'there\n',
      'are\n',
      'many\n',
      'lines\n',
      'here!'
    ]
  );
});
