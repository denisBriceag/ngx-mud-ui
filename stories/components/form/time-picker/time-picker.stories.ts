import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

import { example } from '../../../example';
import { TimeBasicExample } from './examples/time-basic.example';
import basicSource from './examples/time-basic.example.ts?raw';
import { TimeFormsExample } from './examples/time-forms.example';
import formsSource from './examples/time-forms.example.ts?raw';
import { TimeLimitsExample } from './examples/time-limits.example';
import limitsSource from './examples/time-limits.example.ts?raw';
import { TimePickerExample } from './examples/time-picker.example';
import pickerSource from './examples/time-picker.example.ts?raw';
import { TimeStatesExample } from './examples/time-states.example';
import statesSource from './examples/time-states.example.ts?raw';

const meta: Meta<MudTimeInput> = {
  title: 'Components/Form/Time picker',
  component: MudTimeInput,
  decorators: [moduleMetadata({ imports: [MudTimeInput, MudLabel] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    minuteStep: { control: 'inline-radio', options: [1, 5, 10, 15, 30] },
  },
  args: { size: 'medium', minuteStep: 1, clearable: true, disabled: false, invalid: false },
};

export default meta;

type Story = StoryObj<MudTimeInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-time-input
        style="display:block;max-width:320px"
        [size]="size"
        [minuteStep]="minuteStep"
        [min]="min"
        [max]="max"
        [clearable]="clearable"
        [disabled]="disabled"
        [invalid]="invalid"
      >
        <mud-label>Ora</mud-label>
      </mud-time-input>
    `,
  }),
};

export const Basic: Story = example(TimeBasicExample, basicSource);
export const Limits: Story = example(TimeLimitsExample, limitsSource);
export const States: Story = example(TimeStatesExample, statesSource);
export const Picker: Story = example(TimePickerExample, pickerSource);
export const Forms: Story = example(TimeFormsExample, formsSource);
