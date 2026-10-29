import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

import { example } from '../../../example';
import { NumericInputBasicExample } from './examples/numeric-input-basic.example';
import basicSource from './examples/numeric-input-basic.example.ts?raw';
import { NumericInputCurrencyExample } from './examples/numeric-input-currency.example';
import currencySource from './examples/numeric-input-currency.example.ts?raw';
import { NumericInputReactiveExample } from './examples/numeric-input-reactive.example';
import reactiveSource from './examples/numeric-input-reactive.example.ts?raw';
import { NumericInputSignalFormsExample } from './examples/numeric-input-signal-forms.example';
import signalFormsSource from './examples/numeric-input-signal-forms.example.ts?raw';
import { NumericInputStatesExample } from './examples/numeric-input-states.example';
import statesSource from './examples/numeric-input-states.example.ts?raw';

const meta: Meta<MudNumericInput> = {
  title: 'Components/Form/Numeric input',
  component: MudNumericInput,
  decorators: [moduleMetadata({ imports: [MudNumericInput, MudLabel] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
  args: {
    variant: 'default',
    size: 'md',
    showSteppers: true,
    clearable: false,
    step: 1,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudNumericInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-numeric-input
        style="display:block;max-width:320px"
        [variant]="variant"
        [size]="size"
        [showSteppers]="showSteppers"
        [clearable]="clearable"
        [step]="step"
        [min]="min"
        [max]="max"
        [precision]="precision"
        [locale]="locale"
        [disabled]="disabled"
        [invalid]="invalid"
      >
        <mud-label>Cantitate</mud-label>
      </mud-numeric-input>
    `,
  }),
};

export const Basic: Story = example(NumericInputBasicExample, basicSource);
export const Currency: Story = example(NumericInputCurrencyExample, currencySource);
export const States: Story = example(NumericInputStatesExample, statesSource);
export const ReactiveForms: Story = example(NumericInputReactiveExample, reactiveSource);
export const SignalForms: Story = example(NumericInputSignalFormsExample, signalFormsSource);
