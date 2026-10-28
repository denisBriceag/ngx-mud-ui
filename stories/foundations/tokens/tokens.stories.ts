import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { TokenReferenceComponent } from './token-reference.component';

const meta: Meta<TokenReferenceComponent> = {
  title: 'Foundations/Design tokens',
  component: TokenReferenceComponent,
  decorators: [moduleMetadata({ imports: [TokenReferenceComponent] })],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export default meta;

type Story = StoryObj<TokenReferenceComponent>;

export const Reference: Story = {
  render: () => ({ template: `<mud-token-reference />` }),
};
