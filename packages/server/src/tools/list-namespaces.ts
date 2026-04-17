import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpGeneralConfig } from '../config/types.js';

export function registerListNamespacesTool(
  server: McpServer,
  getConfig: () => McpGeneralConfig,
) {
  server.registerTool(
    'list_namespaces',
    {
      description:
        'List all available namespaces with their tools, resources, and prompts counts. Use list_actions to see the specific action names.',
    },
    async () => {
      const lines = Object.entries(getConfig().namespaces).map(
        ([name, ns]) => {
          const parts: string[] = [];
          if (ns.tools) parts.push(`${Object.keys(ns.tools).length} tools`);
          if (ns.resources)
            parts.push(`${Object.keys(ns.resources).length} resources`);
          if (ns.prompts)
            parts.push(`${Object.keys(ns.prompts).length} prompts`);
          const counts = parts.length ? ` (${parts.join(', ')})` : '';
          return ns.description
            ? `${name} — ${ns.description}${counts}`
            : `${name}${counts}`;
        },
      );
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    },
  );
}
