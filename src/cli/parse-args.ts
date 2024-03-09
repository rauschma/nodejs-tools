import { parseArgs } from 'node:util';

export type ParseSubcommandResult<
  TCmdConfig extends ParseArgsConfig,
  TSubcmdConfig extends ParseArgsConfig,
> = {
  commandResult: ParsedResults<TCmdConfig & { tokens: false, allowPositionals: false, args: string[] }>,
  subcommandName: string,
  subcommandResult: ParsedResults<TSubcmdConfig & { tokens: false, args: string[] }>,
};

export function parseSubcommand<
  TCmdConfig extends ParseArgsConfig,
  TSubcmdConfig extends ParseArgsConfig
>(cmdConfig: TCmdConfig, subCmdConfig: TSubcmdConfig, args: Array<string>): ParseSubcommandResult<TCmdConfig, TSubcmdConfig> {
  // The subcommand is a positional, allow them
  const { tokens } = parseArgs({
    options: {
      ...cmdConfig.options,
      ...subCmdConfig.options,
    },
    args,
    tokens: true,
    allowPositionals: true
  });
  if (tokens === undefined) {
    throw new Error();
  }
  let firstPosToken = tokens.find(({ kind }) => kind === 'positional');
  if (!firstPosToken) {
    throw new Error('Command name is missing: ' + cmdConfig.args);
  }

  //----- Command options

  const cmdArgs = args.slice(0, firstPosToken.index);
  const commandResult = parseArgs({
    ...cmdConfig, args: cmdArgs, tokens: false, allowPositionals: false
  });

  //----- Subcommand

  const subcommandName = args[firstPosToken.index];

  const subcmdArgs = args.slice(firstPosToken.index + 1);
  const subcommandResult = parseArgs({
    ...subCmdConfig, args: subcmdArgs, tokens: false
  });

  return {
    commandResult,
    subcommandName,
    subcommandResult,
  };
}

//########## Copied verbatim from node_modules/@types/node/util.d.ts ##########

interface ParseArgsOptionConfig {
  /**
   * Type of argument.
   */
  type: "string" | "boolean";
  /**
   * Whether this option can be provided multiple times.
   * If `true`, all values will be collected in an array.
   * If `false`, values for the option are last-wins.
   * @default false.
   */
  multiple?: boolean | undefined;
  /**
   * A single character alias for the option.
   */
  short?: string | undefined;
  /**
   * The default option value when it is not set by args.
   * It must be of the same type as the the `type` property.
   * When `multiple` is `true`, it must be an array.
   * @since v18.11.0
   */
  default?: string | boolean | string[] | boolean[] | undefined;
}
interface ParseArgsOptionsConfig {
  [longOption: string]: ParseArgsOptionConfig;
}
export interface ParseArgsConfig {
  /**
   * Array of argument strings.
   */
  args?: string[] | undefined;
  /**
   * Used to describe arguments known to the parser.
   */
  options?: ParseArgsOptionsConfig | undefined;
  /**
   * Should an error be thrown when unknown arguments are encountered,
   * or when arguments are passed that do not match the `type` configured in `options`.
   * @default true
   */
  strict?: boolean | undefined;
  /**
   * Whether this command accepts positional arguments.
   */
  allowPositionals?: boolean | undefined;
  /**
   * Return the parsed tokens. This is useful for extending the built-in behavior,
   * from adding additional checks through to reprocessing the tokens in different ways.
   * @default false
   */
  tokens?: boolean | undefined;
}
/*
IfDefaultsTrue and IfDefaultsFalse are helpers to handle default values for missing boolean properties.
TypeScript does not have exact types for objects: https://github.com/microsoft/TypeScript/issues/12936
This means it is impossible to distinguish between "field X is definitely not present" and "field X may or may not be present".
But we expect users to generally provide their config inline or `as const`, which means TS will always know whether a given field is present.
So this helper treats "not definitely present" (i.e., not `extends boolean`) as being "definitely not present", i.e. it should have its default value.
This is technically incorrect but is a much nicer UX for the common case.
The IfDefaultsTrue version is for things which default to true; the IfDefaultsFalse version is for things which default to false.
*/
type IfDefaultsTrue<T, IfTrue, IfFalse> = T extends true ? IfTrue
  : T extends false ? IfFalse
  : IfTrue;

// we put the `extends false` condition first here because `undefined` compares like `any` when `strictNullChecks: false`
type IfDefaultsFalse<T, IfTrue, IfFalse> = T extends false ? IfFalse
  : T extends true ? IfTrue
  : IfFalse;

type ExtractOptionValue<T extends ParseArgsConfig, O extends ParseArgsOptionConfig> = IfDefaultsTrue<
  T["strict"],
  O["type"] extends "string" ? string : O["type"] extends "boolean" ? boolean : string | boolean,
  string | boolean
>;

type ParsedValues<T extends ParseArgsConfig> =
  & IfDefaultsTrue<T["strict"], unknown, { [longOption: string]: undefined | string | boolean }>
  & (T["options"] extends ParseArgsOptionsConfig ? {
    -readonly [LongOption in keyof T["options"]]: IfDefaultsFalse<
      T["options"][LongOption]["multiple"],
      undefined | Array<ExtractOptionValue<T, T["options"][LongOption]>>,
      undefined | ExtractOptionValue<T, T["options"][LongOption]>
    >;
  }
    : {});

type ParsedPositionals<T extends ParseArgsConfig> = IfDefaultsTrue<
  T["strict"],
  IfDefaultsFalse<T["allowPositionals"], string[], []>,
  IfDefaultsTrue<T["allowPositionals"], string[], []>
>;

type PreciseTokenForOptions<
  K extends string,
  O extends ParseArgsOptionConfig,
> = O["type"] extends "string" ? {
  kind: "option";
  index: number;
  name: K;
  rawName: string;
  value: string;
  inlineValue: boolean;
}
  : O["type"] extends "boolean" ? {
    kind: "option";
    index: number;
    name: K;
    rawName: string;
    value: undefined;
    inlineValue: undefined;
  }
  : OptionToken & { name: K };

type TokenForOptions<
  T extends ParseArgsConfig,
  K extends keyof T["options"] = keyof T["options"],
> = K extends unknown
  ? T["options"] extends ParseArgsOptionsConfig ? PreciseTokenForOptions<K & string, T["options"][K]>
  : OptionToken
  : never;

type ParsedOptionToken<T extends ParseArgsConfig> = IfDefaultsTrue<T["strict"], TokenForOptions<T>, OptionToken>;

type ParsedPositionalToken<T extends ParseArgsConfig> = IfDefaultsTrue<
  T["strict"],
  IfDefaultsFalse<T["allowPositionals"], { kind: "positional"; index: number; value: string }, never>,
  IfDefaultsTrue<T["allowPositionals"], { kind: "positional"; index: number; value: string }, never>
>;

type ParsedTokens<T extends ParseArgsConfig> = Array<
  ParsedOptionToken<T> | ParsedPositionalToken<T> | { kind: "option-terminator"; index: number }
>;

type PreciseParsedResults<T extends ParseArgsConfig> = IfDefaultsFalse<
  T["tokens"],
  {
    values: ParsedValues<T>;
    positionals: ParsedPositionals<T>;
    tokens: ParsedTokens<T>;
  },
  {
    values: ParsedValues<T>;
    positionals: ParsedPositionals<T>;
  }
>;

type OptionToken =
  | { kind: "option"; index: number; name: string; rawName: string; value: string; inlineValue: boolean }
  | {
    kind: "option";
    index: number;
    name: string;
    rawName: string;
    value: undefined;
    inlineValue: undefined;
  };

type Token =
  | OptionToken
  | { kind: "positional"; index: number; value: string }
  | { kind: "option-terminator"; index: number };

// If ParseArgsConfig extends T, then the user passed config constructed elsewhere.
// So we can't rely on the `"not definitely present" implies "definitely not present"` assumption mentioned above.
type ParsedResults<T extends ParseArgsConfig> = ParseArgsConfig extends T ? {
  values: {
    [longOption: string]: undefined | string | boolean | Array<string | boolean>;
  };
  positionals: string[];
  tokens?: Token[];
}
  : PreciseParsedResults<T>;
