import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { SpacingGridComponent } from './spacing-grid.component';

const meta: Meta<SpacingGridComponent> = {
  title: 'Foundations/Margin',
  component: SpacingGridComponent,
  decorators: [moduleMetadata({ imports: [SpacingGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<SpacingGridComponent>;

export const Margin: Story = {
  render: () => ({ template: `<egov-spacing-grid kind="margin" />` }),
};
