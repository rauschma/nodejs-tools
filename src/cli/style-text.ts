import { stringCooked, type TagFunction } from '@rauschma/helpers/template-tag/template-tag.js';
import { styleText } from 'node:util';

/** Sadly, `@types/node` does not export this type */
export type Format = Parameters<typeof styleText>[0];

export function styleTextTagFactory(format: Format): TagFunction<string> {
  return (templateStrings, ...substitutions) => (
    styleText(format, stringCooked(templateStrings, ...substitutions))
  );
}
