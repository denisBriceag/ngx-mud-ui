import { Component, signal } from '@angular/core';
import type { CdkTreeNodeOutletContext } from '@angular/cdk/tree';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { MudTree } from './mud-tree.component';
import { MudTreeNode } from './mud-tree-node.component';
import { MudTreeNodeDef } from './mud-tree-node-def.directive';
import { MudBadge } from 'ngx-mud-ui/badge';

interface NavNode {
  id: string;
  label: string;
  /** Leaf routes render as links; nodes without one render as group buttons. */
  url?: string;
  /** Only used by the PageParent host: a parent that is also a page. */
  children?: NavNode[];
}

const DATA: NavNode[] = [
  { id: 'home', label: 'Home', url: '/home' },
  {
    id: 'services',
    label: 'Services',
    children: [
      { id: 'passport', label: 'Passport', url: '/passport' },
      { id: 'id-card', label: 'ID card', url: '/id-card' },
    ],
  },
  { id: 'settings', label: 'Settings', url: '/settings' },
];

const childrenOf = (node: NavNode) => node.children ?? [];

@Component({ template: '' })
class Blank {}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink, MudBadge],
  template: `
    <mud-tree [dataSource]="data" [childrenAccessor]="childrenOf" aria-label="Main navigation">
      <a mud-tree-node *mudTreeNodeDef="let node" [routerLink]="node.url" [selected]="current() === node.id">
        {{ node.label }}<span secondaryLabel>hint</span><mud-badge trailing [count]="2" />
      </a>
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node; when: isGroup"
        [isExpandable]="true"
        [isDisabled]="disabledId() === node.id"
        [selected]="current() === node.id"
      >
        {{ node.label }}
      </button>
    </mud-tree>
  `,
})
class NavHost {
  readonly data = DATA;
  readonly childrenOf = childrenOf;
  readonly isGroup = (_: number, node: NavNode) => !node.url;
  readonly current = signal<string | null>(null);
  readonly disabledId = signal<string | null>(null);
}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink],
  template: `
    <mud-tree [dataSource]="data" [childrenAccessor]="childrenOf" aria-label="Pages">
      <a mud-tree-node *mudTreeNodeDef="let node" [routerLink]="node.url" [isExpandable]="!!node.children?.length">
        {{ node.label }}
      </a>
    </mud-tree>
  `,
})
class PageParentHost {
  readonly data: NavNode[] = [
    { id: 'settings', label: 'Settings', url: '/settings', children: [{ id: 'profile', label: 'Profile', url: '/profile' }] },
  ];
  readonly childrenOf = childrenOf;
}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef],
  template: `
    <mud-tree [dataSource]="data" [levelAccessor]="levelOf">
      <div mud-tree-node *mudTreeNodeDef="let node">{{ node.label }}</div>
    </mud-tree>
  `,
})
class LevelAccessorHost {
  readonly data = [{ label: 'A', level: 0 }];
  readonly levelOf = (node: { level: number }) => node.level;
}

interface ChoiceNode {
  id: string;
  label: string;
  children?: ChoiceNode[];
}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef],
  template: `
    <mud-tree [dataSource]="data" [childrenAccessor]="childrenOf" [multiple]="multiple()" aria-label="Filtre">
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node"
        [isExpandable]="!!node.children?.length"
        [selected]="chosen().has(node.id)"
        (click)="toggle(node)"
      >
        {{ node.label }}
      </button>
    </mud-tree>
  `,
})
class MultipleHost {
  readonly data: ChoiceNode[] = [
    { id: 'docs', label: 'Documente', children: [{ id: 'passport', label: 'Pașaport' }, { id: 'id-card', label: 'Buletin' }] },
  ];
  readonly childrenOf = (node: ChoiceNode) => node.children ?? [];
  readonly multiple = signal(true);
  readonly chosen = signal(new Set<string>());

  toggle(node: ChoiceNode): void {
    if (node.children?.length) return;

    const next = new Set(this.chosen());

    if (next.has(node.id)) next.delete(node.id);
    else next.add(node.id);

    this.chosen.set(next);
  }
}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef],
  template: `
    <mud-tree [dataSource]="data" [childrenAccessor]="childrenOf" aria-label="Typed">
      <div mud-tree-node *mudTreeNodeDef="let node of data" [isExpandable]="!!node.children?.length">{{ node.label }}</div>
    </mud-tree>
  `,
})
class TypedHost {
  readonly data = DATA;
  readonly childrenOf = childrenOf;
}

async function render<T>(type: new () => T) {
  TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] });
  const fixture = TestBed.createComponent(type);

  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    root,
    rows: () => [...root.querySelectorAll<HTMLElement>('.mud-tree-node')],
    row: (label: string) =>
      [...root.querySelectorAll<HTMLElement>('.mud-tree-node')].find(
        (el) => el.querySelector('.mud-tree-item__label')?.textContent?.trim() === label,
      )!,
    settle: () => fixture.whenStable(),
  };
}

function key(el: HTMLElement, k: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}

describe('MudTree', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the CDK tree semantics on the consumer elements', async () => {
    const { root, rows } = await render(NavHost);

    expect(root.querySelector('mud-tree')!.getAttribute('role')).toBe('tree');
    expect(root.querySelector('mud-tree')!.classList).toContain('mud-tree');
    // Collapsed children are not rendered (childrenAccessor flat rendering).
    expect(rows().map((r) => r.querySelector('.mud-tree-item__label')!.textContent!.trim())).toEqual([
      'Home',
      'Services',
      'Settings',
    ]);
    for (const row of rows()) {
      expect(row.getAttribute('role')).toBe('treeitem');
      expect(row.getAttribute('aria-level')).toBe('1');
      expect(row.classList).toContain('mud-tree-item');
    }
  });

  it('indents by CDK level and renders expanded children', async () => {
    const { row, settle } = await render(NavHost);

    expect(row('Services').style.getPropertyValue('--mud-tree-item-depth')).toBe('0');
    row('Services').click();
    await settle();

    expect(row('Passport').getAttribute('aria-level')).toBe('2');
    expect(row('Passport').style.getPropertyValue('--mud-tree-item-depth')).toBe('1');
  });

  it('renders the chevron only on expandable nodes and flips it with expansion', async () => {
    const { row, settle } = await render(NavHost);
    const toggle = (r: HTMLElement) => r.querySelector('.mud-tree-item__toggle');

    expect(toggle(row('Home'))).toBeNull();
    expect(toggle(row('Services'))).not.toBeNull();
    expect(toggle(row('Services'))!.getAttribute('tabindex')).toBe('-1');
    expect(toggle(row('Services'))!.getAttribute('aria-hidden')).toBe('true');
    expect(toggle(row('Services'))!.getAttribute('data-direction')).toBe('down');
    expect(row('Services').getAttribute('aria-expanded')).toBe('false');

    row('Services').click();
    await settle();

    expect(toggle(row('Services'))!.getAttribute('data-direction')).toBe('up');
    expect(row('Services').getAttribute('aria-expanded')).toBe('true');
  });

  it('empty slots match :empty (an un-rendered chevron leaves only a comment)', async () => {
    const { row } = await render(NavHost);

    for (const name of ['icon', 'selected-icon', 'secondary']) {
      expect(row('Services').querySelector(`.mud-tree-item__${name}`)!.matches(':empty')).toBe(true);
    }
    // Services is expandable, so its trailing slot holds the chevron; a leaf without a badge would be :empty.
    const trailing = row('Services').querySelector('.mud-tree-item__trailing')!;
    const elements = [...trailing.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE) as Element[];

    expect(elements.map((c) => c.className)).toEqual(['mud-tree-item__toggle']);
    expect(trailing.textContent).toBe('');
  });

  it('a leaf with no projected content has every slot :empty', async () => {
    const { row, settle } = await render(PageParentHost);

    row('Settings').querySelector<HTMLElement>('.mud-tree-item__toggle')!.click();
    await settle();

    for (const name of ['icon', 'selected-icon', 'secondary', 'trailing']) {
      expect(row('Profile').querySelector(`.mud-tree-item__${name}`)!.matches(':empty')).toBe(true);
    }
  });

  it('a disabled expandable node ignores its chevron and keeps its tabindex', async () => {
    const { host, row, rows, settle } = await render(NavHost);

    host.disabledId.set('services');
    await settle();
    row('Services').querySelector<HTMLElement>('.mud-tree-item__toggle')!.click();
    await settle();

    expect(rows()).toHaveLength(3);
    expect(row('Services').getAttribute('tabindex')).toBe('-1');
  });

  it('sets aria-current="true" on a selected button host', async () => {
    const { host, row, settle } = await render(NavHost);

    host.current.set('services');
    await settle();

    expect(row('Services').getAttribute('aria-current')).toBe('true');
  });

  it('a click on a button group parent toggles both ways', async () => {
    const { row, rows, settle } = await render(NavHost);

    row('Services').click();
    await settle();
    expect(rows()).toHaveLength(5);

    row('Services').click();
    await settle();
    expect(rows()).toHaveLength(3);
  });

  it('Enter on a button parent toggles exactly once', async () => {
    const { row, rows, settle } = await render(NavHost);

    row('Services').focus();
    key(row('Services'), 'Enter');
    await settle();

    expect(rows()).toHaveLength(5);
  });

  it('ArrowRight expands a collapsed node and ArrowLeft collapses it', async () => {
    const { fixture, row, rows, settle } = await render(NavHost);

    row('Services').focus();
    key(row('Services'), 'ArrowRight');
    await settle();
    fixture.detectChanges();

    expect(rows()).toHaveLength(5);

    key(row('Services'), 'ArrowLeft');
    await settle();
    fixture.detectChanges();

    expect(rows()).toHaveLength(3);
  });

  it('ArrowLeft from a child moves focus to its parent', async () => {
    const { fixture, row, settle } = await render(NavHost);

    row('Services').click();
    await settle();
    row('Passport').focus();
    key(row('Passport'), 'ArrowLeft');
    fixture.detectChanges();

    expect(document.activeElement).toBe(row('Services'));
  });

  it('keyup Space on a button node is default-prevented (Firefox activates on keyup)', async () => {
    const { row } = await render(NavHost);
    const event = new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true });

    row('Services').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('Enter on an anchor leaf navigates', async () => {
    const { row, settle } = await render(NavHost);

    row('Settings').focus();
    key(row('Settings'), 'Enter');
    await settle();

    expect(TestBed.inject(Router).url).toBe('/settings');
  });

  it('ArrowDown moves focus exactly one visible row', async () => {
    const { fixture, row } = await render(NavHost);

    row('Home').focus();
    key(row('Home'), 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(row('Services'));
    expect(row('Services').getAttribute('tabindex')).toBe('0');
    expect(row('Home').getAttribute('tabindex')).toBe('-1');

    // Services is collapsed, so its children are skipped.
    key(row('Services'), 'ArrowDown');
    fixture.detectChanges();

    expect(document.activeElement).toBe(row('Settings'));
  });

  it('maps selected to aria-current and the selected class', async () => {
    const { host, row, settle } = await render(NavHost);

    host.current.set('home');
    await settle();

    expect(row('Home').getAttribute('aria-current')).toBe('page');
    expect(row('Home').classList).toContain('mud-tree-item--selected');
    expect(row('Settings').hasAttribute('aria-current')).toBe(false);
  });

  it('typeahead matches the primary label only', async () => {
    const { fixture } = await render(NavHost);
    const nodes = fixture.debugElement.queryAll((de) => de.componentInstance instanceof MudTreeNode);

    expect((nodes[0].componentInstance as MudTreeNode<NavNode>).getLabel()).toBe('Home');
  });

  it('marks a disabled node aria-disabled and ignores its clicks', async () => {
    const { host, row, rows, settle } = await render(NavHost);

    host.disabledId.set('services');
    await settle();
    row('Services').click();
    await settle();

    expect(row('Services').getAttribute('aria-disabled')).toBe('true');
    expect(row('Services').hasAttribute('disabled')).toBe(false);
    expect(rows()).toHaveLength(3);
  });

  it('a page parent row click navigates and expands, but never collapses', async () => {
    const { row, rows, settle } = await render(PageParentHost);

    row('Settings').click();
    await settle();
    expect(TestBed.inject(Router).url).toBe('/settings');
    expect(rows()).toHaveLength(2);

    row('Settings').click();
    await settle();
    expect(rows()).toHaveLength(2);
  });

  it('chevron click on an anchor parent toggles without navigating', async () => {
    const { row, rows, settle } = await render(PageParentHost);
    const toggle = () => row('Settings').querySelector<HTMLElement>('.mud-tree-item__toggle')!;

    toggle().click();
    await settle();
    expect(rows()).toHaveLength(2);
    expect(TestBed.inject(Router).url).toBe('/');

    toggle().click();
    await settle();
    expect(rows()).toHaveLength(1);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('a multiple tree is aria-multiselectable and announces choices with aria-selected', async () => {
    const { root, row, settle } = await render(MultipleHost);

    expect(root.querySelector('mud-tree')!.getAttribute('aria-multiselectable')).toBe('true');

    row('Documente').click();
    await settle();
    row('Pașaport').click();
    await settle();

    expect(row('Pașaport').getAttribute('aria-selected')).toBe('true');
    expect(row('Pașaport').hasAttribute('aria-current')).toBe(false);
    expect(row('Pașaport').classList).toContain('mud-tree-item--selected');
    expect(row('Buletin').getAttribute('aria-selected')).toBe('false');
    // A section only opens and closes: it is not a choice, so it carries no aria-selected.
    expect(row('Documente').hasAttribute('aria-selected')).toBe(false);
  });

  it('a tree without multiple keeps aria-current and never sets aria-selected', async () => {
    const { host, row, settle } = await render(MultipleHost);

    host.multiple.set(false);
    await settle();
    row('Documente').click();
    await settle();
    row('Pașaport').click();
    await settle();

    expect(row('Pașaport').getAttribute('aria-current')).toBe('true');
    expect(row('Pașaport').hasAttribute('aria-selected')).toBe(false);
    expect(row('Buletin').hasAttribute('aria-selected')).toBe(false);
  });

  it('`of` only types the template: rows render exactly as without it', async () => {
    const { rows } = await render(TypedHost);

    expect(rows().map((r) => r.querySelector('.mud-tree-item__label')!.textContent!.trim())).toEqual([
      'Home',
      'Services',
      'Settings',
    ]);
  });

  it('the template-context guard types `let node` from `of`', () => {
    const dir = {} as MudTreeNodeDef<NavNode>;
    const ctx: unknown = { $implicit: DATA[0], level: 0 };

    if (MudTreeNodeDef.ngTemplateContextGuard(dir, ctx)) {
      expectTypeOf(ctx).toEqualTypeOf<CdkTreeNodeOutletContext<NavNode>>();
      expectTypeOf(ctx.$implicit.label).toEqualTypeOf<string>();
    }

    expect(MudTreeNodeDef.ngTemplateContextGuard(dir, ctx)).toBe(true);
  });

  it('warns when the tree has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render(LevelAccessorHost);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mud-tree: add aria-label or aria-labelledby'));
  });

  it('warns when levelAccessor is used', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render(LevelAccessorHost);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mud-tree: levelAccessor is not supported'));
  });
});
