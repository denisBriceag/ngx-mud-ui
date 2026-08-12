import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { DisplayGridComponent } from './display-grid.component';

const meta: Meta<DisplayGridComponent> = {
  title: 'Foundations/Display',
  component: DisplayGridComponent,
  decorators: [moduleMetadata({ imports: [DisplayGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<DisplayGridComponent>;

export const Utilities: Story = {
  render: () => ({ template: `<egov-display-grid />` }),
};
