---
title: Built-in Tools
description: Tools that MCP General provides out of the box.
---

In addition to the tools defined in your config, MCP General provides built-in tools for discovery and initialization.

## `init`

**Available when:** No config file is found.

Creates an example config file and agent rule files in the current working directory. The config format is auto-detected based on the project setup. Agent rules instruct AI assistants to use `list_namespaces` and `list_actions` for context discovery. Existing rule files are not overwritten.

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| Name        | `init`                                                               |
| Parameters  | None                                                                 |
| Description | Create an example mcp-general config and agent rules in the project  |

Files created:
- Config: `mcp-general.config.ts`, `.js`, or `.mcp-generalrc.json`
- `.amazonq/rules/mcp-general.md`
- `.github/instructions/mcp-general.instructions.md`
- `.cursor/rules/mcp-general.mdc`

## `list_namespaces`

**Available when:** A config file is found.

Returns a newline-separated list of all namespace names (with descriptions if provided) from the current config.

| Property    | Value                         |
| ----------- | ----------------------------- |
| Name        | `list_namespaces`             |
| Parameters  | None                          |
| Description | List all available namespaces |

## `list_actions`

**Available when:** A config file is found.

Returns all tools, resources, and prompts registered under a given namespace.

| Property    | Value                                                    |
| ----------- | -------------------------------------------------------- |
| Name        | `list_actions`                                           |
| Parameters  | `namespace` (string) — The namespace to list actions for |
| Description | List all tools, resources, and prompts for a namespace   |

### Example output

```
[tools] exampleui_get_components — All available components
[tools] exampleui_get_styles — https://example.com/bla.md
[resources] exampleui_readme — https://example.com/README.md
```
