import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface NavNode<D = unknown> {
  label: string;
  url?: string;
  children?: NavNode<D>[];
  /** Anything your app needs on the node: ids, permissions, analytics keys… */
  data?: D;
}

interface PageInfo {
  id: string;
  permission?: 'admin' | 'user';
}

const ADMIN_NAV: NavNode<PageInfo>[] = [
  { label: 'Panou', url: '/panou', data: { id: 'dashboard', permission: 'user' } },
  {
    label: 'Administrare',
    children: [
      { label: 'Utilizatori', url: '/utilizatori', data: { id: 'users', permission: 'admin' } },
      { label: 'Roluri', url: '/roluri', data: { id: 'roles', permission: 'admin' } },
      { label: 'Jurnal', url: '/jurnal', data: { id: 'audit-log' } },
    ],
  },
];

@Component({
  selector: 'app-tree-custom-data',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink, RouterLinkActive, MudTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mud-tree [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Administrare">
      <!-- "of nav" types node as NavNode<PageInfo>, so node.data is checked too. -->
      <a
        mud-tree-node
        *mudTreeNodeDef="let node of nav"
        [routerLink]="node.url"
        routerLinkActive
        #rla="routerLinkActive"
        [selected]="rla.isActive"
        (click)="open(node.data)"
      >
        {{ node.label }}
        @if (node.data?.permission === 'admin') {
          <mud-tag trailing size="sm" color="brand">Admin</mud-tag>
        }
      </a>
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node of nav; when: isSection"
        [isExpandable]="true"
      >
        {{ node.label }}
      </button>
    </mud-tree>
    @if (lastOpened(); as page) {
      <p class="last-opened">Last opened: {{ page.id }} ({{ page.permission ?? 'everyone' }})</p>
    }
  `,
  styles: '.last-opened { margin: 12px 24px 0; font-size: 14px; }',
})
export class TreeCustomDataExample {
  readonly nav = ADMIN_NAV;
  readonly lastOpened = signal<PageInfo | undefined>(undefined);
  readonly childrenOf = (node: NavNode<PageInfo>) => node.children ?? [];
  readonly isSection = (_: number, node: NavNode<PageInfo>) => !node.url;

  open(page: PageInfo | undefined): void {
    this.lastOpened.set(page);
  }
}
