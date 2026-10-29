import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

interface StepNode {
  label: string;
  locked?: boolean;
  children?: StepNode[];
}

const STEPS: StepNode[] = [
  { label: 'Date personale' },
  // Disabled: skipped by the arrow keys, and its chevron does not open it.
  { label: 'Documente', locked: true, children: [{ label: 'Pașaport' }, { label: 'Buletin' }] },
  { label: 'Programare' },
];

@Component({
  selector: 'app-tree-disabled',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mud-tree [dataSource]="steps" [childrenAccessor]="childrenOf" aria-label="Pașii cererii">
      <!-- A link cannot be disabled: use a div (or button) host for nodes that can be. -->
      <div
        mud-tree-node
        *mudTreeNodeDef="let node of steps"
        [isDisabled]="!!node.locked"
        [isExpandable]="!!node.children?.length"
      >
        {{ node.label }}
      </div>
    </mud-tree>
  `,
})
export class TreeDisabledExample {
  readonly steps = STEPS;
  readonly childrenOf = (node: StepNode): StepNode[] => node.children ?? [];
}
