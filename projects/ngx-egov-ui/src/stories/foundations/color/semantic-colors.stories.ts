import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ColorGridComponent } from './color-grid.component';

const meta: Meta<ColorGridComponent> = {
  title: 'Foundations/Semantic Colors',
  component: ColorGridComponent,
  decorators: [moduleMetadata({ imports: [ColorGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<ColorGridComponent>;

export const Tokens: Story = {
  render: () => ({ template: `<egov-color-grid mode="semantic" />` }),
};
