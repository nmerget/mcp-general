import { watch } from 'node:fs';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import type { McpGeneralConfig } from './types.js';

const explorer = cosmiconfig('mcp-general', {
  loaders: { '.ts': TypeScriptLoader() },
});

export async function loadConfig() {
  const configPath = process.env.MCPG_CONFIG_PATH;
  if (configPath) return explorer.load(configPath);
  return explorer.search();
}

export function watchConfig(
  filepath: string,
  onChange: (config: McpGeneralConfig) => void,
) {
  let debounce: ReturnType<typeof setTimeout> | undefined;
  watch(filepath, () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      try {
        explorer.clearCaches();
        const updated = await explorer.load(filepath);
        if (updated?.config) onChange(updated.config);
      } catch {
        // ignore invalid config during editing
      }
    }, 200);
  });
}
