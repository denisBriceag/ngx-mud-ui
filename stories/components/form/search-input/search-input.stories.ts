import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { filter, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

import { example } from '../../../example';
import { SearchInputBasicExample } from './examples/search-input-basic.example';
import basicSource from './examples/search-input-basic.example.ts?raw';
import { SearchInputReactiveExample } from './examples/search-input-reactive.example';
import reactiveSource from './examples/search-input-reactive.example.ts?raw';
import { SearchInputShapesExample } from './examples/search-input-shapes.example';
import shapesSource from './examples/search-input-shapes.example.ts?raw';
import { SearchInputStatesExample } from './examples/search-input-states.example';
import statesSource from './examples/search-input-states.example.ts?raw';
import { SearchInputSignalFormsExample } from './examples/search-input-signal-forms.example';
import signalFormsSource from './examples/search-input-signal-forms.example.ts?raw';

const meta: Meta<MudSearchInput> = {
  title: 'Components/Form/Search input',
  component: MudSearchInput,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([filter])] }),
    moduleMetadata({ imports: [MudSearchInput, MudLabel] }),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
  },
  args: {
    size: 'md',
    shape: 'rectangular',
    withButton: false,
    clearable: true,
    loading: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<MudSearchInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-search-input
        style="display:block;max-width:480px"
        placeholder="Caută servicii"
        [size]="size"
        [shape]="shape"
        [withButton]="withButton"
        [clearable]="clearable"
        [loading]="loading"
        [disabled]="disabled"
      >
        <mud-label>Căutare</mud-label>
      </mud-search-input>
    `,
  }),
};

export const Basic: Story = example(SearchInputBasicExample, basicSource);
export const Shapes: Story = example(SearchInputShapesExample, shapesSource);
export const States: Story = example(SearchInputStatesExample, statesSource);
export const ReactiveForms: Story = example(SearchInputReactiveExample, reactiveSource);
export const SignalForms: Story = example(SearchInputSignalFormsExample, signalFormsSource);
