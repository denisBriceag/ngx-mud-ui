import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

import { example } from '../../../example';
import { RadioBasicExample } from './examples/radio-basic.example';
import basicSource from './examples/radio-basic.example.ts?raw';
import { RadioHorizontalExample } from './examples/radio-horizontal.example';
import horizontalSource from './examples/radio-horizontal.example.ts?raw';
import { RadioReactiveExample } from './examples/radio-reactive.example';
import reactiveSource from './examples/radio-reactive.example.ts?raw';
import { RadioSignalFormsExample } from './examples/radio-signal-forms.example';
import signalFormsSource from './examples/radio-signal-forms.example.ts?raw';
import { RadioStatesExample } from './examples/radio-states.example';
import statesSource from './examples/radio-states.example.ts?raw';

const meta: Meta<MudRadioGroup<string>> = {
  title: 'Components/Form/Radio',
  component: MudRadioGroup,
  decorators: [moduleMetadata({ imports: [MudRadioGroup, MudRadio, MudLabel] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
  args: {
    size: 'md',
    orientation: 'vertical',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudRadioGroup<string>>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-radio-group
        [size]="size"
        [orientation]="orientation"
        [disabled]="disabled"
        [required]="required"
        [readonly]="readonly"
        [invalid]="invalid"
      >
        <mud-label>Metoda de plată</mud-label>
        <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
        <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
      </mud-radio-group>
    `,
  }),
};

export const Basic: Story = example(RadioBasicExample, basicSource);
export const States: Story = example(RadioStatesExample, statesSource);
export const Horizontal: Story = example(RadioHorizontalExample, horizontalSource);
export const ReactiveForms: Story = example(RadioReactiveExample, reactiveSource);
export const SignalForms: Story = example(RadioSignalFormsExample, signalFormsSource);
