import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { BorderGridComponent } from './border-grid.component';

const meta: Meta<BorderGridComponent> = {
  title: 'Foundations/Borders',
  component: BorderGridComponent,
  decorators: [moduleMetadata({ imports: [BorderGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<BorderGridComponent>;

export const Tokens: Story = {
  render: () => ({ template: `<mud-border-grid />` }),
};
