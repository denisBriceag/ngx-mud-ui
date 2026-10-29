import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { checkmarkSmall, chevronRightSmall, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudTag } from 'ngx-mud-ui/tag';

import { example } from '../../example';
import { TagIconsExample } from './examples/tag-icons.example';
import iconsSource from './examples/tag-icons.example.ts?raw';
import { TagStatusExample } from './examples/tag-status.example';
import statusSource from './examples/tag-status.example.ts?raw';
import { TagTypesExample } from './examples/tag-types.example';
import typesSource from './examples/tag-types.example.ts?raw';

const meta: Meta<MudTag> = {
  title: 'Components/Tag',
  component: MudTag,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([checkmarkSmall, chevronRightSmall])] }),
    moduleMetadata({ imports: [MudTag] }),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['muted', 'neutral', 'accent', 'success', 'brand', 'danger', 'info'],
    },
    type: { control: 'inline-radio', options: ['subtle', 'strong', 'outlined'] },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
  },
  args: { color: 'success', type: 'subtle', size: 'medium', disabled: false },
};

export default meta;

type Story = StoryObj<MudTag>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<mud-tag [color]="color" [type]="type" [size]="size" [disabled]="disabled">Aprobat</mud-tag>`,
  }),
};

export const Types: Story = example(TagTypesExample, typesSource);
export const Icons: Story = example(TagIconsExample, iconsSource);
export const Status: Story = example(TagStatusExample, statusSource);
