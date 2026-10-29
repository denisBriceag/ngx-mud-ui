import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

import { example } from '../../../example';
import { PhoneInputBasicExample } from './examples/phone-input-basic.example';
import basicSource from './examples/phone-input-basic.example.ts?raw';
import { PhoneInputCountriesExample } from './examples/phone-input-countries.example';
import countriesSource from './examples/phone-input-countries.example.ts?raw';
import { PhoneInputReactiveExample } from './examples/phone-input-reactive.example';
import reactiveSource from './examples/phone-input-reactive.example.ts?raw';
import { PhoneInputSignalFormsExample } from './examples/phone-input-signal-forms.example';
import signalFormsSource from './examples/phone-input-signal-forms.example.ts?raw';
import { PhoneInputInternationalExample } from './examples/phone-input-international.example';
import internationalSource from './examples/phone-input-international.example.ts?raw';
import { PhoneInputStatesExample } from './examples/phone-input-states.example';
import statesSource from './examples/phone-input-states.example.ts?raw';

const meta: Meta<MudPhoneInput> = {
  title: 'Components/Form/Phone input',
  component: MudPhoneInput,
  decorators: [moduleMetadata({ imports: [MudPhoneInput, MudLabel] })],
  argTypes: {
    mode: { control: 'inline-radio', options: ['local', 'international'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
  args: {
    mode: 'local',
    size: 'md',
    clearable: false,
    loading: false,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudPhoneInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-phone-input
        style="display:block;max-width:420px"
        [mode]="mode"
        [size]="size"
        [clearable]="clearable"
        [loading]="loading"
        [disabled]="disabled"
        [invalid]="invalid"
      >
        <mud-label>Telefon</mud-label>
      </mud-phone-input>
    `,
  }),
};

export const Basic: Story = example(PhoneInputBasicExample, basicSource);
export const International: Story = example(PhoneInputInternationalExample, internationalSource);
export const Countries: Story = example(PhoneInputCountriesExample, countriesSource);
export const States: Story = example(PhoneInputStatesExample, statesSource);
export const ReactiveForms: Story = example(PhoneInputReactiveExample, reactiveSource);
export const SignalForms: Story = example(PhoneInputSignalFormsExample, signalFormsSource);
