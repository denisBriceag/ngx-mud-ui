import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

import { example } from '../../../example';
import { NumericInputBasicExample } from './examples/numeric-input-basic.example';
import basicSource from './examples/numeric-input-basic.example.ts?raw';
import { NumericInputCurrencyExample } from './examples/numeric-input-currency.example';
import currencySource from './examples/numeric-input-currency.example.ts?raw';
import { NumericInputFormsExample } from './examples/numeric-input-forms.example';
import formsSource from './examples/numeric-input-forms.example.ts?raw';
import { NumericInputStatesExample } from './examples/numeric-input-states.example';
import statesSource from './examples/numeric-input-states.example.ts?raw';

const meta: Meta<MudNumericInput> = {
  title: 'Components/Form/Numeric input',
  component: MudNumericInput,
  decorators: [moduleMetadata({ imports: [MudNumericInput, MudLabel] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
  },
  args: {
    variant: 'default',
    size: 'medium',
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
export const Forms: Story = example(NumericInputFormsExample, formsSource);
