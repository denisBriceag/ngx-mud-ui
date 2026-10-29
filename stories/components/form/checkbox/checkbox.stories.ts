import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudLabel } from 'ngx-mud-ui/label';

import { example } from '../../../example';
import { CheckboxBasicExample } from './examples/checkbox-basic.example';
import basicSource from './examples/checkbox-basic.example.ts?raw';
import { CheckboxReactiveExample } from './examples/checkbox-reactive.example';
import reactiveSource from './examples/checkbox-reactive.example.ts?raw';
import { CheckboxSelectAllExample } from './examples/checkbox-select-all.example';
import selectAllSource from './examples/checkbox-select-all.example.ts?raw';
import { CheckboxSignalFormsExample } from './examples/checkbox-signal-forms.example';
import signalFormsSource from './examples/checkbox-signal-forms.example.ts?raw';
import { CheckboxStatesExample } from './examples/checkbox-states.example';
import statesSource from './examples/checkbox-states.example.ts?raw';

const meta: Meta<MudCheckbox> = {
  title: 'Components/Form/Checkbox',
  component: MudCheckbox,
  decorators: [moduleMetadata({ imports: [MudCheckbox, MudLabel] })],
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'small'] } },
  args: {
    size: 'medium',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudCheckbox>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-checkbox
        [size]="size"
        [(checked)]="checked"
        [indeterminate]="indeterminate"
        [disabled]="disabled"
        [required]="required"
        [readonly]="readonly"
        [invalid]="invalid"
      >
        <mud-label>Accept termenii și condițiile</mud-label>
      </mud-checkbox>
    `,
  }),
};

export const Basic: Story = example(CheckboxBasicExample, basicSource);
export const States: Story = example(CheckboxStatesExample, statesSource);
export const ReactiveForms: Story = example(CheckboxReactiveExample, reactiveSource);
export const SignalForms: Story = example(CheckboxSignalFormsExample, signalFormsSource);
export const SelectAll: Story = example(CheckboxSelectAllExample, selectAllSource);
