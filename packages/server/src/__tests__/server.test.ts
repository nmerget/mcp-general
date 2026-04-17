import { describe, it, expect, vi } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { registerConfig } from '../config/register.js';
import type { McpGeneralConfig } from '../config/types.js';
import { registerInitTool } from '../tools/init.js';
import { registerListNamespacesTool } from '../tools/list-namespaces.js';
import { registerListActionsTool } from '../tools/list-actions.js';

async function setup(register: (server: McpServer) => void) {
  const server = new McpServer({ name: 'mcp-general', version: '0.0.0' });
  register(server);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { server, client };
}

const testConfig: McpGeneralConfig = {
  namespaces: {
    exampleui: {
      tools: {
        get_components: {
          url: 'https://example.com/components.txt',
          description: 'All available components',
        },
        get_styles: 'https://example.com/styles.md',
      },
    },
    tanstack: {
      resources: {
        documentation: 'https://tanstack.com/README.md',
      },
      prompts: {
        guide: {
          url: 'https://tanstack.com/guide.md',
          description: 'Tanstack guide',
        },
      },
    },
  },
};

describe('registerConfig', () => {
  it('registers tools from config', async () => {
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('exampleui_get_components');
    expect(names).toContain('exampleui_get_styles');
  });

  it('registers resources from config', async () => {
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.name)).toContain('tanstack_documentation');
  });

  it('registers prompts from config', async () => {
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p) => p.name)).toContain('tanstack_guide');
  });

  it('uses description from config', async () => {
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === 'exampleui_get_components');
    expect(tool?.description).toBe('All available components');
  });

  it('auto-generates description for string entries', async () => {
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === 'exampleui_get_styles');
    expect(tool?.description).toBe('Fetch https://example.com/styles.md');
  });

  it('calls tool and returns fetched content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('hello world'),
      }),
    );
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const result = await client.callTool({ name: 'exampleui_get_components' });
    expect(result.isError).toBeFalsy();
    expect((result.content as { text: string }[])[0].text).toBe('hello world');
    vi.unstubAllGlobals();
  });

  it('calls tool and handles fetch error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );
    const { client } = await setup((s) =>
      registerConfig(s, testConfig, process.cwd()),
    );
    const result = await client.callTool({ name: 'exampleui_get_components' });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0].text).toBe(
      'Network error',
    );
    vi.unstubAllGlobals();
  });

  it('reads local file via path', async () => {
    const tmpDir = join(import.meta.dirname, '__tmp__');
    const tmpFile = 'test.md';
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, tmpFile), 'local content');
    try {
      const pathConfig: McpGeneralConfig = {
        namespaces: {
          local: {
            tools: { readme: { path: tmpFile, description: 'Local file' } },
          },
        },
      };
      const { client } = await setup((s) =>
        registerConfig(s, pathConfig, tmpDir),
      );
      const result = await client.callTool({ name: 'local_readme' });
      expect(result.isError).toBeFalsy();
      expect((result.content as { text: string }[])[0].text).toBe(
        'local content',
      );
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('treats non-URL strings as paths', async () => {
    const tmpDir = join(import.meta.dirname, '__tmp__');
    const tmpFile = 'guide.txt';
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, tmpFile), 'guide text');
    try {
      const pathConfig: McpGeneralConfig = {
        namespaces: {
          local: { tools: { guide: tmpFile } },
        },
      };
      const { client } = await setup((s) =>
        registerConfig(s, pathConfig, tmpDir),
      );
      const result = await client.callTool({ name: 'local_guide' });
      expect(result.isError).toBeFalsy();
      expect((result.content as { text: string }[])[0].text).toBe('guide text');
    } finally {
      rmSync(tmpDir, { recursive: true });
    }
  });
});

describe('init tool', () => {
  it('is registered', async () => {
    const { client } = await setup((s) => registerInitTool(s));
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toContain('init');
  });
});

describe('list_namespaces tool', () => {
  it('returns namespace names with counts', async () => {
    const config = testConfig;
    const { client } = await setup((s) =>
      registerListNamespacesTool(s, () => config),
    );
    const result = await client.callTool({ name: 'list_namespaces' });
    const text = (result.content as { text: string }[])[0].text;
    expect(text).toContain('exampleui');
    expect(text).toContain('tanstack');
    expect(text).toContain('2 tools');
    expect(text).toContain('1 resources');
    expect(text).toContain('1 prompts');
  });
});

describe('list_actions tool', () => {
  it('returns actions for a namespace', async () => {
    const config = testConfig;
    const { client } = await setup((s) =>
      registerListActionsTool(s, () => config),
    );
    const result = await client.callTool({
      name: 'list_actions',
      arguments: { namespace: 'exampleui' },
    });
    const text = (result.content as { text: string }[])[0].text;
    expect(text).toContain('exampleui_get_components');
    expect(text).toContain('exampleui_get_styles');
  });

  it('returns error for unknown namespace', async () => {
    const config = testConfig;
    const { client } = await setup((s) =>
      registerListActionsTool(s, () => config),
    );
    const result = await client.callTool({
      name: 'list_actions',
      arguments: { namespace: 'unknown' },
    });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0].text).toContain(
      'Unknown namespace',
    );
  });
});
