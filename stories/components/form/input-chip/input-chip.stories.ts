import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

import { example } from '../../../example';
import { InputChipBasicExample } from './examples/input-chip-basic.example';
import basicSource from './examples/input-chip-basic.example.ts?raw';
import { InputChipReactiveExample } from './examples/input-chip-reactive.example';
import reactiveSource from './examples/input-chip-reactive.example.ts?raw';
import { InputChipSignalFormsExample } from './examples/input-chip-signal-forms.example';
import signalFormsSource from './examples/input-chip-signal-forms.example.ts?raw';
import { InputChipStatesExample } from './examples/input-chip-states.example';
import statesSource from './examples/input-chip-states.example.ts?raw';
import { InputChipValidationExample } from './examples/input-chip-validation.example';
import validationSource from './examples/input-chip-validation.example.ts?raw';

const meta: Meta<MudInputChip> = {
  title: 'Components/Form/Input chip',
  component: MudInputChip,
  decorators: [moduleMetadata({ imports: [MudInputChip, MudLabel] })],
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
  args: { size: 'md', separators: ',', disabled: false, readonly: false, invalid: false },
};

export default meta;

type Story = StoryObj<MudInputChip>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-input-chip
        style="display:block;max-width:480px"
        [size]="size"
        [separators]="separators"
        [maxChips]="maxChips"
        [disabled]="disabled"
        [readonly]="readonly"
        [invalid]="invalid"
      >
        <mud-label>Cuvinte cheie</mud-label>
      </mud-input-chip>
    `,
  }),
};

export const Basic: Story = example(InputChipBasicExample, basicSource);
export const Validation: Story = example(InputChipValidationExample, validationSource);
export const States: Story = example(InputChipStatesExample, statesSource);
export const ReactiveForms: Story = example(InputChipReactiveExample, reactiveSource);
export const SignalForms: Story = example(InputChipSignalFormsExample, signalFormsSource);
