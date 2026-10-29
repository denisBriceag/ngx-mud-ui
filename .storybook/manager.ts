import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI branding: title + library logo shown in the sidebar header.
// `brandImage` and `favicon.svg` (the tab icon, a copy of `logo-mark.svg`) are served from
// `.storybook/public` via `staticDirs` in main.ts.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'ngx-mud-ui',
    // Relative, so the logo opens the Introduction wherever the Storybook is hosted.
    brandUrl: '?path=/docs/introduction--docs',
    brandImage: '/logo.svg',
    brandTarget: '_self',
  }),
});
