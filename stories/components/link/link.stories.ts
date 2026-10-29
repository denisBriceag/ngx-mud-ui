import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLink } from 'ngx-mud-ui/link';

import { example } from '../../example';
import { LinkBasicExample } from './examples/link-basic.example';
import basicSource from './examples/link-basic.example.ts?raw';
import { LinkExternalExample } from './examples/link-external.example';
import externalSource from './examples/link-external.example.ts?raw';
import { LinkSizesExample } from './examples/link-sizes.example';
import sizesSource from './examples/link-sizes.example.ts?raw';
import { LinkTouchTargetExample } from './examples/link-touch-target.example';
import touchTargetSource from './examples/link-touch-target.example.ts?raw';

const meta: Meta<MudLink> = {
  title: 'Components/Link',
  component: MudLink,
  decorators: [moduleMetadata({ imports: [MudLink] })],
  argTypes: {
    mudLink: { control: 'inline-radio', options: ['primary', 'strict'] },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small', 'extra-small'] },
    underline: { control: 'inline-radio', options: ['always', 'hover', 'none'] },
    touchTarget: { control: 'inline-radio', options: ['auto', 'pointer', 'touch', 'none'] },
  },
  args: {
    mudLink: 'primary',
    size: 'medium',
    underline: 'always',
    touchTarget: 'auto',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<MudLink>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <a href="#" [mudLink]="mudLink" [size]="size" [underline]="underline" [touchTarget]="touchTarget" [disabled]="disabled">
        Servicii publice
      </a>
    `,
  }),
};

export const Basic: Story = example(LinkBasicExample, basicSource);
export const Sizes: Story = example(LinkSizesExample, sizesSource);
export const External: Story = example(LinkExternalExample, externalSource);
export const TouchTarget: Story = example(LinkTouchTargetExample, touchTargetSource);
