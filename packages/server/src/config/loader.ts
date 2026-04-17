import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

const explorer = cosmiconfig('mcp-general', {
  loaders: { '.ts': TypeScriptLoader() },
});

export async function loadConfig() {
  explorer.clearCaches();
  const configPath = process.env.MCPG_CONFIG_PATH;
  if (configPath) return explorer.load(configPath);
  return explorer.search();
}
