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
  namespaces: Record<string, McpGeneralNamespace>;
}
```

## `McpGeneralNamespace`

A namespace containing tools, resources, and/or prompts.

```ts
interface McpGeneralNamespace {
  description?: string;
  tools?: Record<string, McpGeneralEntryValue>;
  resources?: Record<string, McpGeneralEntryValue>;
  prompts?: Record<string, McpGeneralEntryValue>;
}
```

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
  | { url: string; path?: never; description?: string; execute?: never }
  | {
      path: string;
      url?: never;
      description?: string;
      execute?: McpGeneralExecute;
    };
```

You must provide exactly one of `url` or `path`.

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
