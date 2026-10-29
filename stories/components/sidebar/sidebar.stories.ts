import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { provideRouter, RouterLink, withHashLocation } from '@angular/router';
import { expect, userEvent, within } from 'storybook/test';
import { MudIconButton } from 'ngx-mud-ui/button';
import {
  calendar,
  chart,
  document as documentIcon,
  download,
  edit,
  filter,
  group,
  history as historyIcon,
  moreVertical,
  MudIconComponent,
  pageDownload,
  pageText,
  pageUpload,
  people,
  plusLarge,
  provideMudIcons,
  search,
  settings,
  sidebar,
} from 'ngx-mud-ui/icons';
import {
  MudSidebar,
  MudSidebarGroup,
  MudSidebarHeader,
  MudSidebarItem,
  MudSidebarToggle,
} from 'ngx-mud-ui/sidebar';

import { example } from '../../example';
import { SidebarBasicExample } from './examples/sidebar-basic.example';
import basicSource from './examples/sidebar-basic.example.ts?raw';
import { SidebarCompactExample } from './examples/sidebar-compact.example';
import compactSource from './examples/sidebar-compact.example.ts?raw';
import { SidebarPageExample } from './examples/sidebar-page.example';
import pageSource from './examples/sidebar-page.example.ts?raw';
import { SidebarRowsExample } from './examples/sidebar-rows.example';
import rowsSource from './examples/sidebar-rows.example.ts?raw';
import { SidebarTreeExample } from './examples/sidebar-tree.example';
import treeSource from './examples/sidebar-tree.example.ts?raw';

const meta: Meta<MudSidebar> = {
  title: 'Components/Sidebar',
  component: MudSidebar,
  decorators: [
    applicationConfig({
      providers: [
        provideMudIcons([
          group,
          chart,
          documentIcon,
          search,
          filter,
          settings,
          download,
          sidebar,
          plusLarge,
          pageText,
          edit,
          pageUpload,
          pageDownload,
          people,
          historyIcon,
          moreVertical,
          calendar,
        ]),
        // Hash routing so the examples' routerLinks navigate inside the Storybook frame.
        provideRouter(
          [
            { path: '', redirectTo: 'toate', pathMatch: 'full' },
            { path: '**', children: [] },
          ],
          withHashLocation(),
        ),
      ],
    }),
    moduleMetadata({
      imports: [
        MudSidebar,
        MudSidebarHeader,
        MudSidebarGroup,
        MudSidebarItem,
        MudSidebarToggle,
        MudIconButton,
        MudIconComponent,
        RouterLink,
      ],
    }),
  ],
  args: { collapsed: false },
};

export default meta;

type Story = StoryObj<MudSidebar>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-sidebar aria-label="Playground" [(collapsed)]="collapsed">
        <div mudSidebarHeader>
          <button mudIconButton mudSidebarToggle aria-label="Menu"><mud-icon name="sidebar" [scale]="20" /></button>
        </div>
        <mud-sidebar-group heading="Services">
          <a mud-sidebar-item routerLink="/overview" selected><mud-icon icon name="group" [scale]="20" />Overview</a>
          <a mud-sidebar-item routerLink="/documents"><mud-icon icon name="document" [scale]="20" />Documents</a>
        </mud-sidebar-group>
      </mud-sidebar>
    `,
  }),
};

export const Basic: Story = example(SidebarBasicExample, basicSource);
export const Rows: Story = example(SidebarRowsExample, rowsSource);
export const Compact: Story = example(SidebarCompactExample, compactSource);
export const Page: Story = example(SidebarPageExample, pageSource, {
  parameters: { layout: 'fullscreen' },
});
export const Tree: Story = example(SidebarTreeExample, treeSource, {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebarEl = canvasElement.querySelector('mud-sidebar');

    // In the rail, opening a section expands the sidebar first.
    await expect(sidebarEl).toHaveClass('mud-sidebar--compact');
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Documents/ }));
    await expect(sidebarEl).not.toHaveClass('mud-sidebar--compact');
    await expect(await canvas.findByRole('treeitem', { name: /Passport/ })).toBeVisible();
  },
});
