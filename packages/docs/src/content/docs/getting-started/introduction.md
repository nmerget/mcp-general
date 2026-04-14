---
title: Introduction
description: Learn what MCP General is and how it works.
---

**MCP General** is a generic [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that dynamically exposes tools, resources, and prompts based on a project-level config file.

## How it works

1. On startup, the server uses [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) to search for a config in the **current working directory** (and parent directories).
2. Each namespace in the config groups related entries. Each entry under `tools`, `resources`, or `prompts` becomes an MCP primitive named `{namespace}_{name}`.
3. When an agent calls a tool, reads a resource, or uses a prompt, the server fetches the configured URL, reads the local file, or executes a script and returns the content.
4. The server **watches the config file** for changes and automatically re-registers all primitives.
5. Local file paths are resolved **relative to the config file**, not the working directory.

## When to use it

- You want to expose external documentation or APIs to an AI agent
- You want to read local project files as MCP resources
- You need a quick, config-only way to set up an MCP server without writing code
