import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { envelope, provideMudIcons, search } from 'ngx-mud-ui/icons';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

import { example } from '../../../example';
import { TextInputBasicExample } from './examples/text-input-basic.example';
import basicSource from './examples/text-input-basic.example.ts?raw';
import { TextInputIconsExample } from './examples/text-input-icons.example';
import iconsSource from './examples/text-input-icons.example.ts?raw';
import { TextInputReactiveExample } from './examples/text-input-reactive.example';
import reactiveSource from './examples/text-input-reactive.example.ts?raw';
import { TextInputSignalFormsExample } from './examples/text-input-signal-forms.example';
import signalFormsSource from './examples/text-input-signal-forms.example.ts?raw';
import { TextInputVariantsExample } from './examples/text-input-variants.example';
import variantsSource from './examples/text-input-variants.example.ts?raw';

const meta: Meta<MudTextInput> = {
  title: 'Components/Form/Text input',
  component: MudTextInput,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([search, envelope])] }),
    moduleMetadata({ imports: [MudTextInput, MudLabel] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'url', 'search'] },
  },
  args: {
    variant: 'default',
    size: 'medium',
    type: 'text',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    loading: false,
    clearable: false,
    placeholder: 'Introduceți textul',
  },
};

export default meta;

type Story = StoryObj<MudTextInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-text-input
        style="display:block;max-width:420px"
        [variant]="variant"
        [size]="size"
        [type]="type"
        [disabled]="disabled"
        [required]="required"
        [readonly]="readonly"
        [invalid]="invalid"
        [loading]="loading"
        [clearable]="clearable"
        [placeholder]="placeholder"
      >
        <mud-label>Etichetă</mud-label>
      </mud-text-input>
    `,
  }),
};

export const Basic: Story = example(TextInputBasicExample, basicSource);
export const Variants: Story = example(TextInputVariantsExample, variantsSource);
export const Icons: Story = example(TextInputIconsExample, iconsSource);
export const ReactiveForms: Story = example(TextInputReactiveExample, reactiveSource);
export const SignalForms: Story = example(TextInputSignalFormsExample, signalFormsSource);
