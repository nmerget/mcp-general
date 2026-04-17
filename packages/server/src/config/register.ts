import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { resolve, extname } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpGeneralConfig, McpGeneralEntry } from './types.js';
import { parseEntry, getEntrySource, resolveCache } from './types.js';
import { compressContent } from './compress.js';
import { readCache, writeCache, DEFAULT_TTL } from './cache.js';

const DEFAULT_RUNNERS: Record<string, { command: string; args?: string[] }> = {
  '.js': { command: 'node' },
  '.ts': { command: 'npx', args: ['tsx'] },
  '.py': { command: 'python' },
  '.sh': { command: 'sh' },
};

function exec(command: string, args: string[]): Promise<string> {
  return new Promise((res, rej) => {
    execFile(command, args, (error, stdout, stderr) => {
      if (error) rej(new Error(stderr || error.message));
      else res(stdout);
    });
  });
}

async function getContent(
  entry: McpGeneralEntry,
  configDir: string,
): Promise<string> {
  if (entry.url) {
    const res = await fetch(entry.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.text();
  }

  const filePath = resolve(configDir, entry.path!);

  if (entry.execute) {
    if (typeof entry.execute === 'object') {
      const { command, args = [] } = entry.execute;
      return exec(command, [...args, filePath]);
    }

    const ext = extname(filePath);
    const runner = DEFAULT_RUNNERS[ext];
    if (!runner) throw new Error(`No default runner for ${ext}`);
    return exec(runner.command, [...(runner.args ?? []), filePath]);
  }

  return readFile(filePath, 'utf-8');
}

async function getCachedContent(
  entry: McpGeneralEntry,
  configDir: string,
  namespace: string,
  name: string,
  source: string,
  ttl: number | false,
): Promise<string> {
  if (ttl !== false) {
    const cached = await readCache(configDir, namespace, name, source, ttl);
    if (cached !== undefined) return cached;
  }

  let text = await getContent(entry, configDir);
  if (entry.compress !== false) text = compressContent(text);

  if (ttl !== false) {
    await writeCache(configDir, namespace, name, source, text);
  }

  return text;
}

export function registerConfig(
  server: McpServer,
  config: McpGeneralConfig,
  configDir: string,
) {
  for (const [namespace, ns] of Object.entries(config.namespaces)) {
    const { tools, resources, prompts } = ns;

    if (tools) {
      for (const [name, value] of Object.entries(tools)) {
        const entry = parseEntry(value);
        const source = getEntrySource(entry);
        const ttl = resolveCache(config.cache, ns.cache, entry.cache, DEFAULT_TTL);
        server.registerTool(
          `${namespace}_${name}`,
          { description: entry.description ?? `Fetch ${source}` },
          async () => {
            try {
              const text = await getCachedContent(entry, configDir, namespace, name, source, ttl);
              return { content: [{ type: 'text' as const, text }] };
            } catch (e: unknown) {
              return {
                content: [
                  { type: 'text' as const, text: (e as Error).message },
                ],
                isError: true,
              };
            }
          },
        );
      }
    }

    if (resources) {
      for (const [name, value] of Object.entries(resources)) {
        const entry = parseEntry(value);
        const source = getEntrySource(entry);
        const uri = `${namespace}://${name}`;
        const ttl = resolveCache(config.cache, ns.cache, entry.cache, DEFAULT_TTL);
        server.registerResource(
          `${namespace}_${name}`,
          uri,
          { description: entry.description ?? `Fetch ${source}` },
          async () => {
            try {
              const text = await getCachedContent(entry, configDir, namespace, name, source, ttl);
              return { contents: [{ uri, text }] };
            } catch (e: unknown) {
              return { contents: [{ uri, text: (e as Error).message }] };
            }
          },
        );
      }
    }

    if (prompts) {
      for (const [name, value] of Object.entries(prompts)) {
        const entry = parseEntry(value);
        const source = getEntrySource(entry);
        const ttl = resolveCache(config.cache, ns.cache, entry.cache, DEFAULT_TTL);
        server.registerPrompt(
          `${namespace}_${name}`,
          { description: entry.description ?? `Fetch ${source}` },
          async () => {
            try {
              const text = await getCachedContent(entry, configDir, namespace, name, source, ttl);
              return {
                messages: [
                  { role: 'user' as const, content: { type: 'text', text } },
                ],
              };
            } catch (e: unknown) {
              return {
                messages: [
                  {
                    role: 'user' as const,
                    content: {
                      type: 'text',
                      text: `Error: ${(e as Error).message}`,
                    },
                  },
                ],
              };
            }
          },
        );
      }
    }
  }
}
