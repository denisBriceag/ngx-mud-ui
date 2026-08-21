import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { SpacingGridComponent } from './spacing-grid.component';

const meta: Meta<SpacingGridComponent> = {
  title: 'Foundations/Spacing',
  component: SpacingGridComponent,
  decorators: [moduleMetadata({ imports: [SpacingGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<SpacingGridComponent>;

export const Spacing: Story = {
  render: () => ({ template: `<mud-spacing-grid kind="gap" />` }),
};
