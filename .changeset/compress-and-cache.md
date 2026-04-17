---
"mcp-general": minor
---

Add content compression and file-based caching.

- **Compress**: All fetched content is now compressed by default — HTML/JSX tags, images, base64 blocks, import statements, and redundant whitespace are stripped to reduce token size. Set `compress: false` on an entry to return raw content.
- **Cache**: Fetched content is cached to the `.mcpg` folder with a default TTL of 1 day. Cache can be configured at root, namespace, or entry level using `true`, `false`, or `{ ttl: <ms> }`. The most specific level wins.
- The `init` tool now adds `.mcpg` to `.gitignore` automatically.
