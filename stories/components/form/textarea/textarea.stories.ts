import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

import { example } from '../../../example';
import { TextareaBasicExample } from './examples/textarea-basic.example';
import basicSource from './examples/textarea-basic.example.ts?raw';
import { TextareaReactiveExample } from './examples/textarea-reactive.example';
import reactiveSource from './examples/textarea-reactive.example.ts?raw';
import { TextareaSignalFormsExample } from './examples/textarea-signal-forms.example';
import signalFormsSource from './examples/textarea-signal-forms.example.ts?raw';
import { TextareaStatesExample } from './examples/textarea-states.example';
import statesSource from './examples/textarea-states.example.ts?raw';

const meta: Meta<MudTextarea> = {
  title: 'Components/Form/Textarea',
  component: MudTextarea,
  decorators: [moduleMetadata({ imports: [MudTextarea, MudLabel] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    resize: { control: 'inline-radio', options: ['vertical', 'none'] },
  },
  args: {
    variant: 'default',
    size: 'md',
    resize: 'vertical',
    rows: 4,
    maxLength: 200,
    disabled: false,
    readonly: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudTextarea>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-textarea
        style="display:block;max-width:480px"
        [variant]="variant"
        [size]="size"
        [resize]="resize"
        [rows]="rows"
        [maxLength]="maxLength"
        [disabled]="disabled"
        [readonly]="readonly"
        [invalid]="invalid"
      >
        <mud-label>Mesaj</mud-label>
      </mud-textarea>
    `,
  }),
};

export const Basic: Story = example(TextareaBasicExample, basicSource);
export const States: Story = example(TextareaStatesExample, statesSource);
export const ReactiveForms: Story = example(TextareaReactiveExample, reactiveSource);
export const SignalForms: Story = example(TextareaSignalFormsExample, signalFormsSource);
