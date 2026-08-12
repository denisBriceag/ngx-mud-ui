import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { WidthGridComponent } from './width-grid.component';

const meta: Meta<WidthGridComponent> = {
  title: 'Foundations/Width',
  component: WidthGridComponent,
  decorators: [moduleMetadata({ imports: [WidthGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<WidthGridComponent>;

export const Width: Story = {
  render: () => ({ template: `<egov-width-grid />` }),
};
