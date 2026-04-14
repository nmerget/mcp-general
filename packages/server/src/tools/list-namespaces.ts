import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpGeneralConfig } from '../config/types.js';

export function registerListNamespacesTool(
  server: McpServer,
  getConfig: () => McpGeneralConfig,
) {
  server.registerTool(
    'list_namespaces',
    { description: 'List all available namespaces' },
    async () => {
      const lines = Object.entries(getConfig().namespaces).map(
        ([name, ns]) => (ns.description ? `${name} — ${ns.description}` : name),
      );
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    },
  );
}
