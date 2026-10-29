import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular-vite';
import { provideRouter, withHashLocation } from '@angular/router';
import { expect, userEvent, within } from 'storybook/test';
import { calendar, group, provideMudIcons, receiptCheck } from 'ngx-mud-ui/icons';
import { MudTree } from 'ngx-mud-ui/tree';

import { example } from '../../example';
import { TreeBadgeExample } from './examples/tree-badge.example';
import badgeSource from './examples/tree-badge.example.ts?raw';
import { TreeCustomDataExample } from './examples/tree-custom-data.example';
import customDataSource from './examples/tree-custom-data.example.ts?raw';
import { TreeDisabledExample } from './examples/tree-disabled.example';
import disabledSource from './examples/tree-disabled.example.ts?raw';
import { TreeExpandAllExample } from './examples/tree-expand-all.example';
import expandAllSource from './examples/tree-expand-all.example.ts?raw';
import { TreeMultipleExample } from './examples/tree-multiple.example';
import multipleSource from './examples/tree-multiple.example.ts?raw';
import { TreeNavigationExample } from './examples/tree-navigation.example';
import navigationSource from './examples/tree-navigation.example.ts?raw';
import { TreeNestedExample } from './examples/tree-nested.example';
import nestedSource from './examples/tree-nested.example.ts?raw';
import { TreePageParentsExample } from './examples/tree-page-parents.example';
import pageParentsSource from './examples/tree-page-parents.example.ts?raw';

// Shows each tree in a sidebar-width column.
const column = componentWrapperDecorator(
  (story) =>
    `<div style="width: 320px; border: 1px solid var(--mud-color-border-base-default)">${story}</div>`,
);

const meta: Meta<MudTree<unknown>> = {
  title: 'Components/Tree',
  component: MudTree,
  decorators: [
    applicationConfig({
      providers: [
        provideMudIcons([group, receiptCheck, calendar]),
        // Hash routing keeps navigation inside the Storybook frame; the redirect opens the first example on a page.
        provideRouter(
          [
            { path: '', redirectTo: 'persoane', pathMatch: 'full' },
            { path: '**', children: [] },
          ],
          withHashLocation(),
        ),
      ],
    }),
  ],
};

export default meta;

type Story = StoryObj<MudTree<unknown>>;

export const Navigation: Story = example(TreeNavigationExample, navigationSource, {
  decorators: [column],
  play: async ({ canvasElement }) => {
    const row = await within(canvasElement).findByRole('treeitem', { name: /Persoane/ });

    await expect(row.querySelector('.mud-tree-item__icon mud-icon')).not.toBeNull();
    await expect(row.querySelector('.mud-tree-item__label mud-icon')).toBeNull();
  },
});
export const PageParents: Story = example(TreePageParentsExample, pageParentsSource, {
  decorators: [column],
});
export const Nested: Story = example(TreeNestedExample, nestedSource, {
  decorators: [column],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('treeitem', { name: /Servicii/ }));
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Acte de identitate/ }));
    await expect(await canvas.findByText('Pașaport')).toBeVisible();
  },
});
export const ExpandAll: Story = example(TreeExpandAllExample, expandAllSource);
export const Badge: Story = example(TreeBadgeExample, badgeSource, { decorators: [column] });
export const CustomData: Story = example(TreeCustomDataExample, customDataSource, {
  decorators: [column],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('treeitem', { name: /Administrare/ }));
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Utilizatori/ }));
    await expect(await canvas.findByText('Last opened: users (admin)')).toBeVisible();
  },
});
export const Multiple: Story = example(TreeMultipleExample, multipleSource, {
  decorators: [column],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('treeitem', { name: /Documente/ });

    await expect(section.querySelector('.badge')?.textContent?.trim()).toBe('2');
    await userEvent.click(section);
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Permis de conducere/ }));
    await expect(section.querySelector('.badge')?.textContent?.trim()).toBe('3');
    await expect(
      await canvas.findByRole('treeitem', { name: /Permis de conducere/ }),
    ).toHaveAttribute('aria-selected', 'true');
  },
});
export const Disabled: Story = example(TreeDisabledExample, disabledSource, {
  decorators: [column],
});
