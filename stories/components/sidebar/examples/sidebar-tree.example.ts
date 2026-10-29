import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudIconButton } from 'ngx-mud-ui/button';
import type { MudIconName } from 'ngx-mud-ui/icons';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import {
  MudSidebar,
  MudSidebarGroup,
  MudSidebarHeader,
  MudSidebarItem,
  MudSidebarToggle,
} from 'ngx-mud-ui/sidebar';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface NavNode {
  label: string;
  /** Pages have a url; nodes without one are sections that only open and close. */
  url?: string;
  icon?: MudIconName;
  children?: NavNode[];
}

// The icons are registered once in app.config.ts: provideMudIcons([sidebar, group, document, calendar, settings])
@Component({
  selector: 'app-sidebar-tree',
  imports: [
    MudSidebar,
    MudSidebarHeader,
    MudSidebarGroup,
    MudSidebarItem,
    MudSidebarToggle,
    MudIconButton,
    MudIconComponent,
    MudTree,
    MudTreeNode,
    MudTreeNodeDef,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <mud-sidebar aria-label="Main navigation" [(collapsed)]="collapsed">
      <div mudSidebarHeader>
        <button mudIconButton mudSidebarToggle aria-label="Menu">
          <mud-icon name="sidebar" [scale]="20" />
        </button>
      </div>
      <mud-sidebar-group heading="Services">
        <mud-tree [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Services">
          <a
            mud-tree-node
            *mudTreeNodeDef="let node of nav"
            [routerLink]="node.url"
            routerLinkActive
            #rla="routerLinkActive"
            [selected]="rla.isActive"
          >
            @if (node.icon) {
              <mud-icon icon [name]="node.icon" [scale]="20" />
            }
            {{ node.label }}
          </a>
          <button
            mud-tree-node
            type="button"
            *mudTreeNodeDef="let node of nav; when: isSection"
            [isExpandable]="true"
          >
            @if (node.icon) {
              <mud-icon icon [name]="node.icon" [scale]="20" />
            }
            {{ node.label }}
          </button>
        </mud-tree>
      </mud-sidebar-group>
      <mud-sidebar-group>
        <a mud-sidebar-item routerLink="/settings"
          ><mud-icon icon name="settings" [scale]="20" />Settings</a
        >
      </mud-sidebar-group>
    </mud-sidebar>
  `,
})
export class SidebarTreeExample {
  readonly collapsed = signal(true);
  readonly nav: NavNode[] = [
    { label: 'People', url: '/people', icon: 'group' },
    {
      label: 'Documents',
      icon: 'document',
      children: [
        { label: 'Passport', url: '/passport' },
        { label: 'ID card', url: '/id-card' },
      ],
    },
    { label: 'Appointments', url: '/appointments', icon: 'calendar' },
  ];

  readonly childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
  readonly isSection = (_: number, node: NavNode): boolean => !node.url;
}
