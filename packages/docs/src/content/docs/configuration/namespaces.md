---
title: Namespaces
description: How namespaces organize your MCP primitives.
---

## What is a namespace?

Each top-level key inside `namespaces` groups related tools, resources, and prompts together. The namespace name is used as a prefix for all registered primitives.

```ts
const config: McpGeneralConfig = {
  namespaces: {
    mylib: {
      description: 'MyLib documentation tools',
      tools: {
        get_docs: 'https://mylib.dev/docs.md',
      },
    },
  },
};
```

This registers a tool named `mylib_get_docs`. The description is shown when using the `list_namespaces` tool.

## Mixing primitives

A namespace can contain any combination of `tools`, `resources`, and `prompts`. You can also set a `cache` option to control caching for all entries in the namespace (see [Config Format](../configuration/format/#caching)):

```ts
namespaces: {
  tanstack: {
    cache: { ttl: 3_600_000 }, // 1 hour for all entries in this namespace
    tools: {
      search: { url: "https://tanstack.com/search", description: "Search docs" },
    },
    resources: {
      readme: "https://tanstack.com/README.md",
    },
    prompts: {
      guide: "https://tanstack.com/guide.md",
    },
  },
}
```

## Multiple namespaces

You can define as many namespaces as you need. Each one is independent:

```ts
namespaces: {
  daisyui: {
    tools: { get_components: "https://daisyui.com/components.txt" },
  },
  tailwind: {
    tools: { get_utilities: "https://tailwindcss.com/utilities.txt" },
  },
}
```
