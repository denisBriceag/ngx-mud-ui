import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface FilterNode {
  id: string;
  label: string;
  children?: FilterNode[];
}

const FILTERS: FilterNode[] = [
  {
    id: 'documents',
    label: 'Documente',
    children: [
      { id: 'passport', label: 'Pașaport' },
      { id: 'id-card', label: 'Buletin' },
      { id: 'license', label: 'Permis de conducere' },
    ],
  },
  {
    id: 'services',
    label: 'Servicii',
    children: [
      { id: 'transport', label: 'Transport' },
      { id: 'health', label: 'Sănătate' },
    ],
  },
];

@Component({
  selector: 'app-tree-multiple',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, MudBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- multiple: several rows can be chosen, announced with aria-selected. -->
    <mud-tree
      [dataSource]="filters"
      [childrenAccessor]="childrenOf"
      multiple
      aria-label="Filtrează documentele"
    >
      <!-- A section opens and closes; its badge counts the chosen children. -->
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node of filters; when: isSection"
        [isExpandable]="true"
      >
        {{ node.label }}
        @if (chosenIn(node); as count) {
          <mud-badge trailing [count]="count" variant="brand" size="xl" />
        }
      </button>
      <!-- A choice: click, Enter or Space toggles it. -->
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node of filters"
        [selected]="chosen().has(node.id)"
        (click)="toggle(node.id)"
      >
        {{ node.label }}
      </button>
    </mud-tree>
  `,
})
export class TreeMultipleExample {
  readonly filters = FILTERS;
  readonly chosen = signal(new Set<string>(['passport', 'id-card']));
  readonly childrenOf = (node: FilterNode): FilterNode[] => node.children ?? [];
  readonly isSection = (_: number, node: FilterNode): boolean => !!node.children?.length;

  /** How many of this section's children are chosen; 0 hides the badge. */
  chosenIn(node: FilterNode): number {
    return (node.children ?? []).filter((child) => this.chosen().has(child.id)).length;
  }

  toggle(id: string): void {
    this.chosen.update((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }
}
