---
title: Config Format
description: How to write a mcp-general config file.
---

## Supported files

Place one of the following in your project root:

- `mcp-general.config.ts` _(recommended for TypeScript projects)_
- `mcp-general.config.js`
- `.mcp-generalrc.json`
- `.mcp-generalrc.yaml`
- `"mcp-general"` key in `package.json`

:::note
After creating or changing the config file, you need to **restart the MCP server** for changes to take effect.
:::

:::tip
Use the `init` tool to automatically generate the right format for your project. See [Setup](../getting-started/setup/) for details.
:::

## TypeScript

If your project has a `tsconfig.json`:

```ts
import type { McpGeneralConfig } from 'mcp-general';

const config: McpGeneralConfig = {
  namespaces: {
    exampleui: {
      tools: {
        get_components: {
          url: 'https://example.com/components.txt',
          description: 'All available components',
        },
        get_styles: 'https://example.com/bla.md',
        get_local: {
          path: './docs/local-guide.md',
          description: 'Read local guide',
        },
      },
    },
    tanstack: {
      resources: {
        documentation: 'https://tanstack.com/README.md',
      },
      prompts: {
        do: 'https://tanstack.com/do.md',
      },
    },
  },
};

export default config;
```

## JavaScript

If your project has a `package.json` but no `tsconfig.json`:

```js
/** @type {import("mcp-general").McpGeneralConfig} */
const config = {
  namespaces: {
    exampleui: {
      tools: {
        get_components: {
          url: 'https://example.com/components.txt',
          description: 'All available components',
        },
        get_styles: 'https://example.com/bla.md',
      },
    },
  },
};

export default config;
```

## JSON

If your project has neither `tsconfig.json` nor `package.json`:

```json
{
  "namespaces": {
    "exampleui": {
      "tools": {
        "get_components": {
          "url": "https://example.com/components.txt",
          "description": "All available components"
        },
        "get_styles": "https://example.com/bla.md"
      }
    }
  }
}
```

## Entry values

Values can be:

- A **string** — URLs (starting with `http://` or `https://`) are fetched, otherwise treated as a local file path
- An **object** with either `url` or `path` (required) and `description` (optional)

### Executing scripts

For `path` entries, you can set `execute` to run the file as a script instead of reading its content:

- `execute: true` — auto-detects the runner based on file extension
- `execute: { command, args? }` — use a custom command

Default runners when `execute: true`:

| Extension | Command       |
| --------- | ------------- |
| `.js`     | `node`        |
| `.ts`     | `npx tsx`     |
| `.py`     | `python`      |
| `.sh`     | `sh`          |

```ts
tools: {
  // Auto-detect: runs with `node ./scripts/generate.js`
  generate: {
    path: "./scripts/generate.js",
    execute: true,
    description: "Run generate script",
  },
  // Custom command: runs with `deno run ./scripts/fetch.ts`
  fetch: {
    path: "./scripts/fetch.ts",
    execute: { command: "deno", args: ["run"] },
    description: "Run fetch script with Deno",
  },
}
```

### Compressing content

By default, all content is compressed before being returned — HTML/JSX tags, images, base64 blocks, import statements, and redundant whitespace are stripped to reduce token size for LLM consumption.

To disable compression for a specific entry, set `compress: false`:

```ts
tools: {
  // Compression is ON by default — no need to set anything
  get_llms: {
    url: "https://example.com/llms-full.txt",
    description: "Compressed documentation",
  },
  // Disable compression for entries where raw content matters
  get_raw: {
    path: "./docs/raw-template.html",
    compress: false,
    description: "Raw HTML template",
  },
}
```

### Caching

By default, all fetched content is cached to the `.mcpg` folder in your project root with a TTL of **1 day** (86 400 000 ms). Cached files are plain text — you can inspect them at any time.

Cache can be configured at three levels, where the most specific level wins:

1. **Root** — applies to all namespaces and entries
2. **Namespace** — applies to all entries in that namespace
3. **Entry** — applies to a single entry

Each level accepts `true` (default TTL), `false` (disabled), or `{ ttl: <ms> }` for a custom TTL.

```ts
import type { McpGeneralConfig } from 'mcp-general';

const config: McpGeneralConfig = {
  // Root level: default for everything
  cache: { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  namespaces: {
    docs: {
      // Namespace level: override root for this namespace
      cache: { ttl: 60 * 60 * 1000 }, // 1 hour
      tools: {
        // Entry level: disable cache for this specific tool
        get_live_status: {
          url: 'https://example.com/status',
          cache: false,
        },
        // Uses namespace TTL (1 hour)
        get_guide: 'https://example.com/guide.md',
      },
    },
    static: {
      // No namespace cache set → uses root TTL (7 days)
      tools: {
        get_reference: 'https://example.com/reference.md',
      },
    },
  },
};

export default config;
```

:::tip
The `init` tool automatically adds `.mcpg` to your `.gitignore`. If you set up the project manually, make sure to add it yourself.
:::

## Resulting registrations

The TypeScript example above would register:

| Type     | Name                       | Description                          |
| -------- | -------------------------- | ------------------------------------ |
| Tool     | `exampleui_get_components` | All available components             |
| Tool     | `exampleui_get_styles`     | Fetch https://example.com/bla.md     |
| Tool     | `exampleui_get_local`      | Read local guide                     |
| Resource | `tanstack_documentation`   | Fetch https://tanstack.com/README.md |
| Prompt   | `tanstack_do`              | Fetch https://tanstack.com/do.md     |
