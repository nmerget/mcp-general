#!/usr/bin/env node

import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/loader.js';
import { registerConfig } from './config/register.js';
import type { McpGeneralConfig } from './config/types.js';
import { registerInitTool } from './tools/init.js';
import { registerListNamespacesTool } from './tools/list-namespaces.js';
import { registerListActionsTool } from './tools/list-actions.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

async function main() {
  const result = await loadConfig();
  const server = new McpServer({ name: 'mcp-general', version });

  if (!result?.config) {
    registerInitTool(server);
    await server.connect(new StdioServerTransport());
    return;
  }

  const config: McpGeneralConfig = result.config;
  const configDir = result.filepath.replace(/[/\\][^/\\]+$/, '');

  registerListNamespacesTool(server, () => config);
  registerListActionsTool(server, () => config);
  registerConfig(server, config, configDir);

  await server.connect(new StdioServerTransport());
}

main();
