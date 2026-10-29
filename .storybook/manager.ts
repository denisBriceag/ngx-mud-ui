import { addons } from 'storybook/manager-api';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { create } from 'storybook/theming';

// Storybook UI branding: title + library logo shown in the sidebar header.
// `brandImage` and `favicon.svg` (the tab icon, a copy of `logo-mark.svg`) are served from
// `.storybook/public` via `staticDirs` in main.ts.
const theme = (base: 'light' | 'dark') =>
  create({
    base,
    brandTitle: 'ngx-mud-ui',
    // Relative, so the logo opens the Introduction wherever the Storybook is hosted.
    brandUrl: '?path=/docs/introduction--docs',
    brandImage: base === 'dark' ? '/logo-dark.svg' : '/logo.svg',
    brandTarget: '_self',
  });

addons.setConfig({ theme: theme('light') });

// The Theme toolbar (a global, see preview.ts) switches the Storybook UI too, not only the stories.
// SET_GLOBALS carries the theme a page opens with (`&globals=theme:dark`), GLOBALS_UPDATED each switch.
addons.register('ngx-mud-ui/theme', (api) => {
  const apply = (globals: Record<string, unknown> | undefined) =>
    api.setOptions({ theme: theme(globals?.['theme'] === 'dark' ? 'dark' : 'light') });

  apply(api.getGlobals());
  api.on(SET_GLOBALS, ({ globals }) => apply(globals));
  api.on(GLOBALS_UPDATED, ({ globals }) => apply(globals));
});
