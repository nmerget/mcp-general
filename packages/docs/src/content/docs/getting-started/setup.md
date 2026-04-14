---
title: Setup
description: How to set up mcp-general in your project.
---

## MCP client configuration

Add the server to your MCP client (e.g. Claude Desktop, Cursor, VS Code):

```json
{
  "mcpServers": {
    "mcp-general": {
      "command": "npx",
      "args": ["-y", "mcp-general"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

Set `cwd` to the project that contains your config file. See [Config Format](../configuration/format/) for all supported formats.

### Alternative: global install

If you prefer not to use `npx`, install globally:

```bash
npm i -g mcp-general
```

Then use `mcp-general` directly:

```json
{
  "mcpServers": {
    "mcp-general": {
      "command": "mcp-general",
      "cwd": "/path/to/your/project"
    }
  }
}
```

## Init tool

If no config file is found, the server exposes a single `init` tool. When called by an agent, it detects your project setup and creates:

### Config file

| Project has         | Generated file          |
| ------------------- | ----------------------- |
| `tsconfig.json`     | `mcp-general.config.ts` |
| `package.json` only | `mcp-general.config.js` |
| Neither             | `.mcp-generalrc.json`   |

### Agent rules

The `init` tool also creates instruction files that tell AI agents to use `list_namespaces` and `list_actions` for discovering available context:

| Agent          | File                                            |
| -------------- | ----------------------------------------------- |
| Amazon Q       | `.amazonq/rules/mcp-general.md`                 |
| GitHub Copilot | `.github/instructions/mcp-general.instructions.md` |
| Cursor         | `.cursor/rules/mcp-general.mdc`                 |

Existing rule files are not overwritten.

## Local development

To run from source:

```bash
git clone https://github.com/nmerget/mcp-general.git
cd mcp-general
pnpm install
pnpm build
```

Then point your MCP client to the local build:

```json
{
  "mcpServers": {
    "mcp-general": {
      "command": "node",
      "args": ["/path/to/mcp-general/packages/server/dist/index.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```
