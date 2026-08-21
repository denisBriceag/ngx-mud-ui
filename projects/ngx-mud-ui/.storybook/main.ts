import type { StorybookConfig } from '@storybook/angular-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  // The source package.json has an `exports` field (styles/assets), so Vite's
  // Node-exports resolution rejects entry-point subpaths like `ngx-mud-ui/input`
  // that the Angular builders resolve via tsconfig paths. Alias them back to
  // the entry sources here (styles/assets keep going through `exports`).
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {};

    const entryAlias = {
      find: /^ngx-mud-ui\/(?!styles\/|assets\/)([^/]+)$/,
      replacement: resolve(configDir, '../$1/src/public-api.ts'),
    };
    const alias = viteConfig.resolve.alias;

    if (Array.isArray(alias)) {
      alias.push(entryAlias);
    } else {
      viteConfig.resolve.alias = [
        ...Object.entries(alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string })),
        entryAlias,
      ];
    }

    return viteConfig;
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['./public'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      compodoc: true,
      compodocArgs: ['-e', 'json', '-d', 'projects/ngx-mud-ui'],
    },
  },
};

export default config;
