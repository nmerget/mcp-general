// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE,
  integrations: [
    starlight({
      title: 'MCP General',
      favicon: '/favicon.ico',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/nmerget/mcp-general',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Setup', slug: 'getting-started/setup' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Config Format', slug: 'configuration/format' },
            { label: 'Namespaces', slug: 'configuration/namespaces' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Built-in Tools', slug: 'reference/built-in-tools' },
            { label: 'Types', slug: 'reference/types' },
          ],
        },
      ],
    }),
  ],
});
