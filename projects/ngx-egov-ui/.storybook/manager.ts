import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI branding: title + eGov logo shown in the sidebar header.
// `brandImage` is served from `.storybook/public` via `staticDirs` in main.ts.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'ngx-egov-ui',
    brandUrl: 'https://github.com/egov-moldova/design-system',
    brandImage: '/age-badge.svg',
    brandTarget: '_self',
  }),
});
