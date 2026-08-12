import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { ShadowGridComponent } from './shadow-grid.component';

const meta: Meta<ShadowGridComponent> = {
  title: 'Foundations/Elevation',
  component: ShadowGridComponent,
  decorators: [moduleMetadata({ imports: [ShadowGridComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<ShadowGridComponent>;

export const Levels: Story = {
  render: () => ({ template: `<egov-shadow-grid />` }),
};
