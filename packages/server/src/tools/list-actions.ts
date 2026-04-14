import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type {
  McpGeneralConfig,
  McpGeneralEntryValue,
} from '../config/types.js';
import { parseEntry, getEntrySource } from '../config/types.js';

export function registerListActionsTool(
  server: McpServer,
  getConfig: () => McpGeneralConfig,
) {
  server.registerTool(
    'list_actions',
    {
      description: 'List all tools, resources, and prompts for a namespace',
      inputSchema: {
        namespace: z.string().describe('The namespace to list actions for'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    async ({ namespace }: { namespace: string }) => {
      const ns = getConfig().namespaces[namespace];
      if (!ns)
        return {
          content: [
            { type: 'text' as const, text: `Unknown namespace: ${namespace}` },
          ],
          isError: true,
        };

      const lines: string[] = [];
      for (const [type, entries] of Object.entries(ns)) {
        for (const [name, value] of Object.entries(
          entries as Record<string, McpGeneralEntryValue>,
        )) {
          const entry = parseEntry(value);
          lines.push(
            `[${type}] ${namespace}_${name} — ${entry.description ?? getEntrySource(entry)}`,
          );
        }
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    },
  );
}
