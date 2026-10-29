import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { document as documentIcon, group, provideMudIcons, settings } from 'ngx-mud-ui/icons';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';

import { example } from '../../example';
import { TreeItemBasicExample } from './examples/tree-item-basic.example';
import basicSource from './examples/tree-item-basic.example.ts?raw';
import { TreeItemLevelsExample } from './examples/tree-item-levels.example';
import levelsSource from './examples/tree-item-levels.example.ts?raw';
import { TreeItemTrailingExample } from './examples/tree-item-trailing.example';
import trailingSource from './examples/tree-item-trailing.example.ts?raw';

const meta: Meta<MudTreeItem> = {
  title: 'Components/Tree Item',
  component: MudTreeItem,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([group, documentIcon, settings])] }),
    moduleMetadata({ imports: [MudTreeItem] }),
  ],
  args: { selected: false, level: 1 },
};

export default meta;

type Story = StoryObj<MudTreeItem>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<a mud-tree-item href="#" [selected]="selected" [level]="level" style="max-width:320px">Documents</a>`,
  }),
};

export const Basic: Story = example(TreeItemBasicExample, basicSource);
export const Trailing: Story = example(TreeItemTrailingExample, trailingSource);
export const Levels: Story = example(TreeItemLevelsExample, levelsSource);
