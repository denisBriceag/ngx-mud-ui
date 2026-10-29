import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudChip } from 'ngx-mud-ui/chip';
import { document as documentIcon, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { ChipContentExample } from './examples/chip-content.example';
import contentSource from './examples/chip-content.example.ts?raw';
import { ChipFilterExample } from './examples/chip-filter.example';
import filterSource from './examples/chip-filter.example.ts?raw';
import { ChipInputExample } from './examples/chip-input.example';
import inputSource from './examples/chip-input.example.ts?raw';
import { ChipSizesExample } from './examples/chip-sizes.example';
import sizesSource from './examples/chip-sizes.example.ts?raw';

const meta: Meta<MudChip> = {
  title: 'Components/Chip',
  component: MudChip,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([documentIcon])] }),
    moduleMetadata({ imports: [MudChip] }),
  ],
  argTypes: {
    type: { control: 'inline-radio', options: ['filter', 'input'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    selectionMode: { control: 'inline-radio', options: ['mono', 'multi'] },
  },
  args: {
    type: 'filter',
    size: 'md',
    selectionMode: 'mono',
    selected: false,
    disabled: false,
    removable: true,
  },
};

export default meta;

type Story = StoryObj<MudChip>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-chip
        [type]="type"
        [size]="size"
        [selectionMode]="selectionMode"
        [(selected)]="selected"
        [count]="count"
        [disabled]="disabled"
        [removable]="removable"
      >
        Acte necesare
      </mud-chip>
    `,
  }),
};

export const Filter: Story = example(ChipFilterExample, filterSource);
export const Input: Story = example(ChipInputExample, inputSource);
export const Content: Story = example(ChipContentExample, contentSource);
export const Sizes: Story = example(ChipSizesExample, sizesSource);
