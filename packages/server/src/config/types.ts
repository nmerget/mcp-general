export interface McpGeneralExecuteConfig {
  command: string;
  args?: string[];
}

export type McpGeneralExecute = boolean | McpGeneralExecuteConfig;

export type McpGeneralEntry =
  | { url: string; path?: never; description?: string; execute?: never }
  | {
      path: string;
      url?: never;
      description?: string;
      execute?: McpGeneralExecute;
    };

export type McpGeneralEntryValue = string | McpGeneralEntry;

export interface McpGeneralNamespace {
  description?: string;
  tools?: Record<string, McpGeneralEntryValue>;
  resources?: Record<string, McpGeneralEntryValue>;
  prompts?: Record<string, McpGeneralEntryValue>;
}

export interface McpGeneralConfig {
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
