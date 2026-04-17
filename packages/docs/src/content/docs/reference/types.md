---
title: Types
description: TypeScript types exported by mcp-general.
---

The `mcp-general` package exports the following types for use in your config files:

```ts
import type { McpGeneralConfig } from "mcp-general";
```

## `McpGeneralConfig`

The root config object.

```ts
interface McpGeneralConfig {
  cache?: McpGeneralCache;
  namespaces: Record<string, McpGeneralNamespace>;
}
```

The optional `cache` field sets the default caching behavior for all namespaces and entries. See [`McpGeneralCache`](#mcpgeneralcache).

## `McpGeneralNamespace`

A namespace containing tools, resources, and/or prompts.

```ts
interface McpGeneralNamespace {
  description?: string;
  cache?: McpGeneralCache;
  tools?: Record<string, McpGeneralEntryValue>;
  resources?: Record<string, McpGeneralEntryValue>;
  prompts?: Record<string, McpGeneralEntryValue>;
}
```

The optional `cache` field overrides the root-level cache setting for all entries in this namespace.

## `McpGeneralEntryValue`

Each entry can be a string or an object:

```ts
type McpGeneralEntryValue = string | McpGeneralEntry;
```

- **String** — URLs (`http://` / `https://`) are fetched, anything else is read as a local file path
- **Object** — see `McpGeneralEntry`

## `McpGeneralEntry`

An object entry with either a `url` or `path`, and an optional `description`. Path entries can also include `execute`.

```ts
type McpGeneralEntry =
  | { url: string; path?: never; description?: string; execute?: never; compress?: boolean; cache?: McpGeneralCache }
  | {
      path: string;
      url?: never;
      description?: string;
      execute?: McpGeneralExecute;
      compress?: boolean;
      cache?: McpGeneralCache;
    };
```

You must provide exactly one of `url` or `path`. Content is compressed by default (HTML/JSX tags, images, base64 blocks, and redundant whitespace are stripped). Set `compress: false` to return raw content. The optional `cache` field overrides both root and namespace cache settings for this entry.

## `McpGeneralExecute`

Controls whether a `path` entry is executed as a script:

```ts
type McpGeneralExecute = boolean | McpGeneralExecuteConfig;
```

- `true` — auto-detect the runner based on file extension (`.js` → `node`, `.ts` → `npx tsx`, `.py` → `python`, `.sh` → `sh`)
- An object — use a custom command

## `McpGeneralExecuteConfig`

Custom execution command:

```ts
interface McpGeneralExecuteConfig {
  command: string;
  args?: string[];
}
```

The file path is always appended as the last argument. For example, `{ command: "deno", args: ["run"] }` with path `./script.ts` runs `deno run ./script.ts`.

## `McpGeneralCache`

Controls caching behavior. Can be set at root, namespace, or entry level. The most specific level wins (entry > namespace > root).

```ts
type McpGeneralCache = boolean | McpGeneralCacheConfig;
```

- `true` (default) — cache with the default TTL of 1 day
- `false` — disable caching
- An object — use a custom TTL

## `McpGeneralCacheConfig`

Custom cache configuration:

```ts
interface McpGeneralCacheConfig {
  ttl: number;
}
```

The `ttl` is specified in milliseconds. For example, `{ ttl: 3_600_000 }` caches for 1 hour.

Cached files are stored as plain text in the `.mcpg` directory at your project root, organized by namespace: `.mcpg/<namespace>/<name>.txt`. A `.meta.json` file alongside each cached file tracks the timestamp for TTL expiration.
