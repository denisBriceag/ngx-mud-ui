import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { LayoutGridComponent } from './layout-grid.component';

const meta: Meta<LayoutGridComponent> = {
  title: 'Foundations/Layout Grid',
  component: LayoutGridComponent,
  decorators: [moduleMetadata({ imports: [LayoutGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<LayoutGridComponent>;

export const LayoutGrid: Story = {
  render: () => ({ template: `<mud-layout-grid />` }),
};
