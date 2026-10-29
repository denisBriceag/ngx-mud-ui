import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { provideMudIcons, sparkles } from 'ngx-mud-ui/icons';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

import { example } from '../../example';
import { InlineMessageFieldExample } from './examples/inline-message-field.example';
import fieldSource from './examples/inline-message-field.example.ts?raw';
import { InlineMessageIconExample } from './examples/inline-message-icon.example';
import iconSource from './examples/inline-message-icon.example.ts?raw';
import { InlineMessageVariantsExample } from './examples/inline-message-variants.example';
import variantsSource from './examples/inline-message-variants.example.ts?raw';

const meta: Meta<MudInlineMessage> = {
  title: 'Components/Inline message',
  component: MudInlineMessage,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([sparkles])] }),
    moduleMetadata({ imports: [MudInlineMessage] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'warning', 'success', 'error'] },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
  },
  args: { variant: 'info', size: 'medium', hideIcon: false },
};

export default meta;

type Story = StoryObj<MudInlineMessage>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-inline-message [variant]="variant" [size]="size" [hideIcon]="hideIcon">
        Introduceți un IDNP valid.
      </mud-inline-message>
    `,
  }),
};

export const Variants: Story = example(InlineMessageVariantsExample, variantsSource);
export const Icon: Story = example(InlineMessageIconExample, iconSource);
export const Field: Story = example(InlineMessageFieldExample, fieldSource);
