import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { document as documentIcon, lock, notification, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

import { example } from '../../example';
import { TabsBasicExample } from './examples/tabs-basic.example';
import basicSource from './examples/tabs-basic.example.ts?raw';
import { TabsControlledExample } from './examples/tabs-controlled.example';
import controlledSource from './examples/tabs-controlled.example.ts?raw';
import { TabsLabelsExample } from './examples/tabs-labels.example';
import labelsSource from './examples/tabs-labels.example.ts?raw';
import { TabsOverflowExample } from './examples/tabs-overflow.example';
import overflowSource from './examples/tabs-overflow.example.ts?raw';
import { TabsSizesExample } from './examples/tabs-sizes.example';
import sizesSource from './examples/tabs-sizes.example.ts?raw';

const meta: Meta<MudTabGroup> = {
  title: 'Components/Tabs',
  component: MudTabGroup,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([notification, documentIcon, lock])] }),
    moduleMetadata({ imports: [MudTabGroup, MudTab] }),
  ],
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
  args: { size: 'md', stretchTabs: false },
};

export default meta;

type Story = StoryObj<MudTabGroup>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-tab-group [size]="size" [stretchTabs]="stretchTabs" aria-label="Playground">
        <mud-tab label="Overview"><p>Overview.</p></mud-tab>
        <mud-tab label="Documents" [badgeCount]="2"><p>Documents.</p></mud-tab>
        <mud-tab label="Disabled" disabled><p>Disabled.</p></mud-tab>
      </mud-tab-group>
    `,
  }),
};

export const Basic: Story = example(TabsBasicExample, basicSource);
export const Sizes: Story = example(TabsSizesExample, sizesSource);
export const Labels: Story = example(TabsLabelsExample, labelsSource);
export const Overflow: Story = example(TabsOverflowExample, overflowSource);
export const Controlled: Story = example(TabsControlledExample, controlledSource);
