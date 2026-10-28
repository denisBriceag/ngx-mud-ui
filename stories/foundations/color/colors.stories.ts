import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ColorGridComponent } from './color-grid.component';

const meta: Meta<ColorGridComponent> = {
  title: 'Foundations/Colors',
  component: ColorGridComponent,
  decorators: [moduleMetadata({ imports: [ColorGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<ColorGridComponent>;

export const Palette: Story = {
  render: () => ({ template: `<mud-color-grid mode="primitives" />` }),
};
