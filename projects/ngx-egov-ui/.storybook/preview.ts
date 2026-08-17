import type { Decorator, Preview } from '@storybook/angular-vite';
import { setCompodocJson } from '@storybook/addon-docs/angular';

import docJson from '../documentation.json';

// Structural styles for CDK overlays.
import '@angular/cdk/overlay-prebuilt.css';
import './design-tokens.scss';

setCompodocJson(docJson);

// Theme must live on the ROOT element — nested data-theme wrappers don't
// re-resolve the chained --color-* tokens (see Foundations/Dark Mode).
const withTheme: Decorator = (story, context) => {
  if (context.globals['theme'] === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  return story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Design-system color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Components', '*'] },
    },
    // The Theme toolbar owns the canvas background (via body tokens);
    // the Backgrounds picker would fight it.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
