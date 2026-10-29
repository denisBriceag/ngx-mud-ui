import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

import { example } from '../../../example';
import { SelectBasicExample } from './examples/select-basic.example';
import basicSource from './examples/select-basic.example.ts?raw';
import { SelectFormsExample } from './examples/select-forms.example';
import formsSource from './examples/select-forms.example.ts?raw';
import { SelectSearchableExample } from './examples/select-searchable.example';
import searchableSource from './examples/select-searchable.example.ts?raw';
import { SelectServerExample } from './examples/select-server.example';
import serverSource from './examples/select-server.example.ts?raw';
import { SelectStatesExample } from './examples/select-states.example';
import statesSource from './examples/select-states.example.ts?raw';

const meta: Meta<MudSelectInput<string>> = {
  title: 'Components/Form/Select input',
  component: MudSelectInput,
  decorators: [moduleMetadata({ imports: [MudSelectInput, MudLabel] })],
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
  args: {
    size: 'md',
    searchable: false,
    loading: false,
    disabled: false,
    readonly: false,
    invalid: false,
    placeholder: 'Alegeți raionul',
  },
};

export default meta;

type Story = StoryObj<MudSelectInput<string>>;

export const Playground: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: ['Chișinău', 'Bălți', 'Cahul', 'Orhei', 'Ungheni'].map((label) => ({
        value: label,
        label,
      })),
    },
    template: `
      <mud-select-input
        style="display:block;max-width:420px"
        [options]="options"
        [size]="size"
        [searchable]="searchable"
        [loading]="loading"
        [disabled]="disabled"
        [readonly]="readonly"
        [invalid]="invalid"
        [placeholder]="placeholder"
      >
        <mud-label>Raion</mud-label>
      </mud-select-input>
    `,
  }),
};

export const Basic: Story = example(SelectBasicExample, basicSource);
export const States: Story = example(SelectStatesExample, statesSource);
export const Searchable: Story = example(SelectSearchableExample, searchableSource);
export const Server: Story = example(SelectServerExample, serverSource);
export const Forms: Story = example(SelectFormsExample, formsSource);
