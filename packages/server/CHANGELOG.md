# MCP General

## 1.2.0

### Minor Changes

- [#9](https://github.com/nmerget/mcp-general/pull/9) [`a23b278`](https://github.com/nmerget/mcp-general/commit/a23b278b07850d94c08647df70b1d4c49903f3df) Thanks [@nmerget](https://github.com/nmerget)! - Add content compression and file-based caching.
  - **Compress**: All fetched content is now compressed by default — HTML/JSX tags, images, base64 blocks, import statements, and redundant whitespace are stripped to reduce token size. Set `compress: false` on an entry to return raw content.
  - **Cache**: Fetched content is cached to the `.mcpg` folder with a default TTL of 1 day. Cache can be configured at root, namespace, or entry level using `true`, `false`, or `{ ttl: <ms> }`. The most specific level wins.
  - The `init` tool now adds `.mcpg` to `.gitignore` automatically.

## 1.1.0

### Minor Changes

- [#7](https://github.com/nmerget/mcp-general/pull/7) [`dc73d0a`](https://github.com/nmerget/mcp-general/commit/dc73d0ad81bc0e9df05a2cd3d18f271945851ed9) Thanks [@nmerget](https://github.com/nmerget)! - Add `MCPG_CONFIG_PATH` environment variable to override the config file path instead of auto-detecting via cosmiconfig.

### Patch Changes

- [#7](https://github.com/nmerget/mcp-general/pull/7) [`dc73d0a`](https://github.com/nmerget/mcp-general/commit/dc73d0ad81bc0e9df05a2cd3d18f271945851ed9) Thanks [@nmerget](https://github.com/nmerget)! - The `init` tool now checks if `mcp-general` is installed as a dependency in TypeScript projects and returns a note for the agent to install it for type support.

## 1.0.0

### Major Changes

- [`2897ea1`](https://github.com/nmerget/mcp-general/commit/2897ea19904fbc1be815b057a765a1f836465aa6) Thanks [@nmerget](https://github.com/nmerget)! - Initial release of mcp-general.
  - Config-driven MCP server with tools, resources, and prompts
  - Namespace-based organization with descriptions
  - URL fetching and local file reading
  - Script execution via `execute` option
  - Auto-detection of config format (TypeScript, JavaScript, JSON)
  - File watcher for hot-reload on config changes
  - Built-in `init`, `list_namespaces`, and `list_actions` tools
  - Agent rule generation for Amazon Q, GitHub Copilot, and Cursor
