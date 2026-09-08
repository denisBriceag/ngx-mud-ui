import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { storybookAngularVitest } from "@storybook/angular-vite/vitest";
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [{
      extends: true,
      plugins: [// Forwards Angular build options (styles, assets, zoneless, …) into standalone vitest runs
      storybookAngularVitest({}),
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      optimizeDeps: {
        include: [
          '@angular/cdk/a11y',
          '@angular/cdk/accordion',
          '@angular/cdk/overlay',
          '@angular/cdk/portal',
          '@angular/cdk/stepper',
          '@angular/common',
          '@angular/common/http',
          '@angular/compiler',
          '@angular/core',
          '@angular/core/rxjs-interop',
          '@angular/forms',
          '@angular/forms/signals',
          '@angular/platform-browser',
          '@angular/platform-browser/animations',
          '@storybook/addon-docs',
          // pnpm-nested deps of addon-docs, unreachable as bare ids from this
          // root — the `>` chain is how vite's include addresses them.
          '@storybook/addon-docs > @mdx-js/react',
          '@storybook/addon-docs > @storybook/react-dom-shim',
          '@storybook/addon-docs/angular',
          '@storybook/addon-docs/blocks',
          '@storybook/angular-vite',
          '@storybook/angular-vite/client',
          '@storybook/angular-vite/client/config',
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
          'tslib'
        ]
      },
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});
