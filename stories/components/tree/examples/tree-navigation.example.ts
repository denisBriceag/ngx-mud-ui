import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudIconComponent, type MudIconName } from 'ngx-mud-ui/icons';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface NavNode<D = unknown> {
  label: string;
  /** Pages have a url; nodes without one are sections that only open and close. */
  url?: string;
  icon?: MudIconName;
  count?: number;
  children?: NavNode<D>[];
  /** Anything your app needs on the node: ids, permissions, analytics keys… */
  data?: D;
}

const NAV: NavNode[] = [
  { label: 'Persoane', url: '/persoane', icon: 'group' },
  {
    label: 'Documente',
    icon: 'receipt-check',
    children: [
      { label: 'Pașaport', url: '/pasaport', icon: 'receipt-check' },
      { label: 'Buletin', url: '/buletin', icon: 'receipt-check', count: 2 },
    ],
  },
  { label: 'Programări', url: '/programari', icon: 'calendar', count: 3 },
];

// The icons are registered once in app.config.ts: provideMudIcons([calendar, group, receiptCheck])
@Component({
  selector: 'app-tree-navigation',
  imports: [
    MudTree,
    MudTreeNode,
    MudTreeNodeDef,
    MudIconComponent,
    RouterLink,
    RouterLinkActive,
    MudBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mud-tree [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Navigare">
      <!-- A page: routerLinkActive drives the selected state. -->
      <a
        mud-tree-node
        *mudTreeNodeDef="let node of nav"
        [routerLink]="node.url"
        routerLinkActive
        #rla="routerLinkActive"
        [selected]="rla.isActive"
        [isExpandable]="!!node.children?.length"
      >
        <!-- One @if per slotted element: Angular projects an @if block by its single root. -->
        @if (node.icon) {
          <mud-icon icon [name]="node.icon" [scale]="20" />
        }
        @if (node.icon) {
          <mud-icon selectedIcon [name]="node.icon" variant="filled" [scale]="20" />
        }
        {{ node.label }}
        @if (node.count) {
          <mud-badge trailing [count]="node.count" variant="neutral" size="xl" />
        }
      </a>
      <!-- A section: no url, a click opens and closes it. -->
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
        @if (node.count) {
          <mud-badge trailing [count]="node.count" variant="neutral" size="xl" />
        }
      </button>
    </mud-tree>
  `,
})
export class TreeNavigationExample {
  readonly nav = NAV;
  readonly childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
  readonly isSection = (_: number, node: NavNode): boolean => !node.url;
}
