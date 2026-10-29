import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import { person, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { AvatarBasicExample } from './examples/avatar-basic.example';
import basicSource from './examples/avatar-basic.example.ts?raw';
import { AvatarNameExample } from './examples/avatar-name.example';
import nameSource from './examples/avatar-name.example.ts?raw';
import { AvatarSizesExample } from './examples/avatar-sizes.example';
import sizesSource from './examples/avatar-sizes.example.ts?raw';
import { AvatarStackExample } from './examples/avatar-stack.example';
import stackSource from './examples/avatar-stack.example.ts?raw';

const meta: Meta<MudAvatar> = {
  title: 'Components/Avatar',
  component: MudAvatar,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([person])] }),
    moduleMetadata({ imports: [MudAvatar] }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
    },
  },
  args: { size: 'medium', name: 'Olga Popescu', initials: undefined, label: undefined },
};

export default meta;

type Story = StoryObj<MudAvatar>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<mud-avatar [size]="size" [name]="name" [initials]="initials" [label]="label" />`,
  }),
};

export const Basic: Story = example(AvatarBasicExample, basicSource);
export const Name: Story = example(AvatarNameExample, nameSource);
export const Sizes: Story = example(AvatarSizesExample, sizesSource);
export const Stack: Story = example(AvatarStackExample, stackSource);
