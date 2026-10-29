import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { BreakpointExplorer } from './breakpoint-explorer.component';

const meta: Meta = {
  title: 'Foundations/Breakpoints',
  decorators: [moduleMetadata({ imports: [BreakpointExplorer] })],
};

export default meta;

/** Drag the width, or click a band, to see which breakpoint and mixins match. */
export const Explorer: StoryObj = {
  parameters: {
    controls: { disable: true },
    docs: { canvas: { sourceState: 'none' } },
  },
  render: () => ({ template: `<mud-breakpoint-explorer />` }),
};
