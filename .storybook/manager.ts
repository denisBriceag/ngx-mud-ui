import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI branding: title + library logo shown in the sidebar header.
// `brandImage` is served from `.storybook/public` via `staticDirs` in main.ts.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'ngx-mud-ui',
    brandUrl: 'https://github.com/denisBriceag/ngx-mud-ui',
    brandImage: '/logo.svg',
    brandTarget: '_self',
  }),
});
