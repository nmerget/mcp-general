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

:::tip
Use the `init` tool to automatically generate the right format for your project. See [Setup](/getting-started/setup/) for details.
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

## Resulting registrations

The TypeScript example above would register:

| Type     | Name                       | Description                          |
| -------- | -------------------------- | ------------------------------------ |
| Tool     | `exampleui_get_components` | All available components             |
| Tool     | `exampleui_get_styles`     | Fetch https://example.com/bla.md     |
| Tool     | `exampleui_get_local`      | Read local guide                     |
| Resource | `tanstack_documentation`   | Fetch https://tanstack.com/README.md |
| Prompt   | `tanstack_do`              | Fetch https://tanstack.com/do.md     |
