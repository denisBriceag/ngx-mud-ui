import type { StorybookConfig } from '@storybook/angular-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  // The source package.json has an `exports` field (prebuilt CSS, fonts), so Vite's
  // Node-exports resolution rejects entry-point subpaths like `ngx-mud-ui/text-input`
  // that the Angular builders resolve via tsconfig paths. Alias them back to
  // the entry sources here (prebuilt/fonts keep going through `exports`).
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {};

    const entryAlias = {
      find: /^ngx-mud-ui\/(?!prebuilt\/|fonts\/)([^/]+)$/,
      replacement: resolve(configDir, '../$1/src/public-api.ts'),
    };
    const alias = viteConfig.resolve.alias;

    if (Array.isArray(alias)) {
      alias.push(entryAlias);
    } else {
      viteConfig.resolve.alias = [
        ...Object.entries(alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        })),
        entryAlias,
      ];
    }

    // Everything the stories reach must be pre-bundled up front. Vite otherwise
    // discovers a dependency the first time a story imports it, re-optimizes and
    // reloads the preview mid-navigation, and from then on every docs page
    // throws "Illegal invocation" from addon-docs' focus polyfill (the runtime
    // and blocks chunks end up on different optimized copies). One missing
    // entry is enough, so the list is the full `optimized` set Vite's cache
    // metadata reports, not just our direct imports. Same reason as
    // `optimizeDeps.include` in vitest.config.ts.
    viteConfig.optimizeDeps ??= {};
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include ?? []),
      '@angular/cdk/a11y',
      '@angular/cdk/accordion',
      '@angular/cdk/collections',
      '@angular/cdk/dialog',
      '@angular/cdk/keycodes',
      '@angular/cdk/layout',
      '@angular/cdk/overlay',
      '@angular/cdk/portal',
      '@angular/cdk/stepper',
      '@angular/cdk/table',
      '@angular/cdk/tree',
      '@angular/common',
      '@angular/common/http',
      '@angular/compiler',
      '@angular/core',
      '@angular/core/rxjs-interop',
      '@angular/forms',
      '@angular/forms/signals',
      '@angular/platform-browser',
      '@angular/platform-browser/animations',
      '@angular/router',
      '@mdx-js/react',
      '@storybook/addon-docs',
      '@storybook/addon-docs > @mdx-js/react',
      '@storybook/addon-docs > @storybook/react-dom-shim',
      '@storybook/addon-docs/angular',
      '@storybook/addon-docs/blocks',
      '@storybook/angular-vite',
      '@storybook/angular-vite/client',
      '@storybook/angular-vite/client/config',
      '@storybook/global',
      '@storybook/react-dom-shim',
      'axe-core',
      'react',
      'react-dom/client',
      'react/jsx-runtime',
      'rxjs',
      'rxjs/operators',
      'storybook/highlight',
      'storybook/internal/client-logger',
      'storybook/internal/core-events',
      'storybook/internal/docs-tools',
      'storybook/internal/preview-errors',
      'storybook/internal/preview/runtime',
      'storybook/preview-api',
      'storybook/test',
      'telejson',
      'ts-dedent',
      'tslib',
    ];

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
  // Storybook 10.6 turned the docgen server on by default; its props table lists every non-private
  // member (protected template bindings like `_hostClasses` included) and bypasses the
  // inputs/outputs filter in compodoc-argtypes.ts. Off = the Compodoc path that filter wraps.
  features: { experimentalDocgenServer: false },
  framework: {
    name: '@storybook/angular-vite',
    options: {
      compodoc: true,
      // Protected/private members are implementation detail: without these flags
      // compodoc publishes `_hostClasses`, `_toggle`, etc. into the ArgTypes
      // tables alongside the real inputs and outputs.
      compodocArgs: [
        '-e',
        'json',
        '-d',
        'projects/ngx-mud-ui',
        '--disableProtected',
        '--disablePrivate',
        '--disableInternal',
      ],
    },
  },
};

export default config;
