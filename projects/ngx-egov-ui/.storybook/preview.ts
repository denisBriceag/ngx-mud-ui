import type { Preview } from '@storybook/angular-vite';
import { setCompodocJson } from '@storybook/addon-docs/angular';

import docJson from '../documentation.json';

// Structural styles for CDK overlays.
import '@angular/cdk/overlay-prebuilt.css';
import './design-tokens.scss';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Components', '*'] },
    },
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
