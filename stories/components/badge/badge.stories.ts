import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudBadge } from 'ngx-mud-ui/badge';
import { notification, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { BadgeCornerExample } from './examples/badge-corner.example';
import cornerSource from './examples/badge-corner.example.ts?raw';
import { BadgeInlineExample } from './examples/badge-inline.example';
import inlineSource from './examples/badge-inline.example.ts?raw';
import { BadgeLiveExample } from './examples/badge-live.example';
import liveSource from './examples/badge-live.example.ts?raw';
import { BadgeMaxExample } from './examples/badge-max.example';
import maxSource from './examples/badge-max.example.ts?raw';
import { BadgeSizesExample } from './examples/badge-sizes.example';
import sizesSource from './examples/badge-sizes.example.ts?raw';
import { BadgeVariantsExample } from './examples/badge-variants.example';
import variantsSource from './examples/badge-variants.example.ts?raw';

const meta: Meta<MudBadge> = {
  title: 'Components/Badge',
  component: MudBadge,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([notification])] }),
    moduleMetadata({ imports: [MudBadge] }),
  ],
  argTypes: {
    type: { control: 'inline-radio', options: ['numbered', 'dot'] },
    variant: {
      control: 'select',
      options: [
        'default',
        'brand',
        'positive',
        'warning',
        'danger',
        'dark',
        'light',
        'neutral',
        'accent',
      ],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: {
    count: 5,
    max: 99,
    type: 'numbered',
    variant: 'danger',
    size: 'md',
    disabled: false,
    live: false,
  },
};

export default meta;

type Story = StoryObj<MudBadge>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-badge
        [count]="count"
        [max]="max"
        [type]="type"
        [variant]="variant"
        [size]="size"
        [disabled]="disabled"
        [live]="live"
      />
    `,
  }),
};

export const Inline: Story = example(BadgeInlineExample, inlineSource);
export const Sizes: Story = example(BadgeSizesExample, sizesSource);
export const Variants: Story = example(BadgeVariantsExample, variantsSource);
export const Max: Story = example(BadgeMaxExample, maxSource);
export const Live: Story = example(BadgeLiveExample, liveSource);
export const Corner: Story = example(BadgeCornerExample, cornerSource);
