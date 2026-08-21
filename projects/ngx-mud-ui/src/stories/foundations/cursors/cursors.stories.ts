import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { CursorGridComponent } from './cursor-grid.component';

const meta: Meta<CursorGridComponent> = {
  title: 'Foundations/Cursors',
  component: CursorGridComponent,
  decorators: [moduleMetadata({ imports: [CursorGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<CursorGridComponent>;

export const Reference: Story = {
  render: () => ({ template: `<mud-cursor-grid />` }),
};
