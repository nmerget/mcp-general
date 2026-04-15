import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const EXAMPLE_NAMESPACES = {
  example: {
    description: 'Example namespace',
    tools: {
      get_readme: {
        url: 'https://example.com/README.md',
        description: 'Fetch the README',
      },
    },
  },
};

const TS_CONFIG = `import type { McpGeneralConfig } from "mcp-general";

const config: McpGeneralConfig = {
  namespaces: {
    example: {
      description: "Example namespace",
      tools: {
        get_readme: {
          url: "https://example.com/README.md",
          description: "Fetch the README",
        },
      },
    },
  },
};

export default config;
`;

const JS_CONFIG = `/** @type {import("mcp-general").McpGeneralConfig} */
const config = {
  namespaces: {
    example: {
      description: "Example namespace",
      tools: {
        get_readme: {
          url: "https://example.com/README.md",
          description: "Fetch the README",
        },
      },
    },
  },
};

export default config;
`;

const AGENT_RULE = `When starting a new conversation or needing additional context, use the mcp-general MCP server:

1. Call the \`list_namespaces\` tool to discover available namespaces.
2. Call the \`list_actions\` tool with a namespace to see its available tools, resources, and prompts.
3. Use the relevant tools to fetch documentation or context before answering.
`;

const AGENT_FILES: Record<string, string> = {
  '.amazonq/rules/mcp-general.md': AGENT_RULE,
  '.github/instructions/mcp-general.instructions.md': AGENT_RULE,
  '.cursor/rules/mcp-general.mdc': AGENT_RULE,
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeWithDirs(path: string, content: string): Promise<void> {
  const dir = join(path, '..');
  await mkdir(dir, { recursive: true });
  await writeFile(path, content);
}

async function hasDep(cwd: string, name: string): Promise<boolean> {
  try {
    const pkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8'));
    return !!(
      pkg.dependencies?.[name] ||
      pkg.devDependencies?.[name] ||
      pkg.peerDependencies?.[name]
    );
  } catch {
    return false;
  }
}

export function registerInitTool(server: McpServer) {
  server.registerTool(
    'init',
    {
      description:
        'Create an example mcp-general config and agent rules in the current project',
    },
    async () => {
      const cwd = process.cwd();
      const hasTsconfig = await exists(join(cwd, 'tsconfig.json'));
      const hasPackageJson = await exists(join(cwd, 'package.json'));

      let filename: string;
      let content: string;
      const created: string[] = [];

      if (hasTsconfig) {
        filename = 'mcp-general.config.ts';
        content = TS_CONFIG;
        if (!(await hasDep(cwd, 'mcp-general'))) {
          created.push(
            'NOTE: Please install mcp-general as a dev dependency for type support (e.g. pnpm add -D mcp-general)',
          );
        }
      } else if (hasPackageJson) {
        filename = 'mcp-general.config.js';
        content = JS_CONFIG;
      } else {
        filename = '.mcp-generalrc.json';
        content =
          JSON.stringify({ namespaces: EXAMPLE_NAMESPACES }, null, 2) + '\n';
      }

      const configPath = join(cwd, filename);
      await writeFile(configPath, content);
      created.push(filename);

      for (const [relativePath, ruleContent] of Object.entries(AGENT_FILES)) {
        const fullPath = join(cwd, relativePath);
        if (!(await exists(fullPath))) {
          await writeWithDirs(fullPath, ruleContent);
          created.push(relativePath);
        }
      }

      return {
        content: [
          { type: 'text' as const, text: `Created:\n${created.join('\n')}` },
        ],
      };
    },
  );
}
