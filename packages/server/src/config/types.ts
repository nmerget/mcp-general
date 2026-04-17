export interface McpGeneralExecuteConfig {
  command: string;
  args?: string[];
}

export type McpGeneralExecute = boolean | McpGeneralExecuteConfig;

export interface McpGeneralCacheConfig {
  ttl: number;
}

export type McpGeneralCache = boolean | McpGeneralCacheConfig;

export type McpGeneralEntry =
  | {
      url: string;
      path?: never;
      description?: string;
      execute?: never;
      compress?: boolean;
      cache?: McpGeneralCache;
    }
  | {
      path: string;
      url?: never;
      description?: string;
      execute?: McpGeneralExecute;
      compress?: boolean;
      cache?: McpGeneralCache;
    };

export type McpGeneralEntryValue = string | McpGeneralEntry;

export interface McpGeneralNamespace {
  description?: string;
  cache?: McpGeneralCache;
  tools?: Record<string, McpGeneralEntryValue>;
  resources?: Record<string, McpGeneralEntryValue>;
  prompts?: Record<string, McpGeneralEntryValue>;
}

export interface McpGeneralConfig {
  cache?: McpGeneralCache;
  namespaces: Record<string, McpGeneralNamespace>;
}

export function parseEntry(value: McpGeneralEntryValue): McpGeneralEntry {
  if (typeof value === 'string') {
    return value.startsWith('http://') || value.startsWith('https://')
      ? { url: value }
      : { path: value };
  }
  return value;
}

export function getEntrySource(entry: McpGeneralEntry): string {
  return entry.url ?? entry.path!;
}

function normalizeCacheTtl(value: McpGeneralCache | undefined): number | false {
  if (value === false) return false;
  if (value === undefined || value === true) return -1; // sentinel: use parent
  return value.ttl;
}

/**
 * Resolves the effective TTL by merging entry > namespace > root.
 * Returns `false` if caching is disabled, otherwise the TTL in ms.
 */
export function resolveCache(
  root: McpGeneralCache | undefined,
  namespace: McpGeneralCache | undefined,
  entry: McpGeneralCache | undefined,
  defaultTtl: number,
): number | false {
  // Entry level takes priority
  const e = normalizeCacheTtl(entry);
  if (e === false) return false;
  if (e > 0) return e;

  // Namespace level
  const n = normalizeCacheTtl(namespace);
  if (n === false) return false;
  if (n > 0) return n;

  // Root level
  const r = normalizeCacheTtl(root);
  if (r === false) return false;
  if (r > 0) return r;

  return defaultTtl;
}
