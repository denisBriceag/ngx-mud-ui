import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { TypographyGridComponent } from './typography-grid.component';

const meta: Meta<TypographyGridComponent> = {
  title: 'Foundations/Typography',
  component: TypographyGridComponent,
  decorators: [moduleMetadata({ imports: [TypographyGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<TypographyGridComponent>;

export const Scale: Story = {
  render: () => ({ template: `<egov-typography-grid />` }),
};
