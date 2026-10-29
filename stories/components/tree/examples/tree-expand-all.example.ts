import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudButton } from 'ngx-mud-ui/button';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface NavNode {
  label: string;
  url?: string;
  children?: NavNode[];
}

const SERVICES: NavNode[] = [
  {
    label: 'Servicii',
    children: [
      {
        label: 'Acte de identitate',
        children: [
          { label: 'Pașaport', url: '/servicii/pasaport' },
          { label: 'Buletin', url: '/servicii/buletin' },
        ],
      },
      { label: 'Transport', url: '/servicii/transport' },
    ],
  },
  { label: 'Plăți', url: '/plati' },
];

@Component({
  selector: 'app-tree-expand-all',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink, RouterLinkActive, MudButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <button mudButton="outlined" type="button" (click)="tree.expandAll()">Expand all</button>
      <button mudButton="outlined" type="button" (click)="tree.collapseAll()">Collapse all</button>
    </div>
    <mud-tree
      #tree="mudTree"
      [dataSource]="nav"
      [childrenAccessor]="childrenOf"
      aria-label="Servicii"
    >
      <a
        mud-tree-node
        *mudTreeNodeDef="let node of nav"
        [routerLink]="node.url"
        routerLinkActive
        #rla="routerLinkActive"
        [selected]="rla.isActive"
      >
        {{ node.label }}
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
  `,
  styles: '.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }',
})
export class TreeExpandAllExample {
  readonly nav = SERVICES;
  readonly childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
  readonly isSection = (_: number, node: NavNode): boolean => !node.url;
}
