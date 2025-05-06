import { parseArgs, type ParseArgsConfig } from 'node:util';

type ParsedResults<T extends ParseArgsConfig> = ReturnType<typeof parseArgs<T>>;

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
