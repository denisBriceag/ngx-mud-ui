import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { MudTree } from './mud-tree.component';
import { MudTreeNode } from './mud-tree-node.component';
import { MudTreeNodeDef } from './mud-tree-node-def.directive';

interface NavNode {
  id: string;
  label: string;
  url?: string;
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
  { id: 'archive', label: 'Archive' },
];

@Component({ template: '' })
class Blank {}

@Component({
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink],
  template: `
    <mud-tree #tree="mudTree" [dataSource]="data" [childrenAccessor]="childrenOf" [multiple]="multiple()" aria-label="Main">
      <a mud-tree-node *mudTreeNodeDef="let node of data" [routerLink]="node.url" [selected]="node.id === 'home'">
        {{ node.label }}
      </a>
      <button
        mud-tree-node
        type="button"
        *mudTreeNodeDef="let node of data; when: isSection"
        [isExpandable]="!!node.children?.length"
        [isDisabled]="node.id === 'archive'"
      >
        {{ node.label }}<span trailing class="badge">2</span>
      </button>
    </mud-tree>
  `,
})
class Host {
  readonly data = DATA;
  readonly multiple = signal(false);
  readonly childrenOf = (node: NavNode) => node.children ?? [];
  readonly isSection = (_: number, node: NavNode) => !node.url;
}

async function renderOnServer() {
  TestBed.configureTestingModule({
    providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideRouter([{ path: '**', component: Blank }])],
  });

  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const root: HTMLElement = fixture.nativeElement;
  const row = (label: string) =>
    Array.from(root.querySelectorAll<HTMLElement>('.mud-tree-node')).find(
      (el) => el.querySelector('.mud-tree-item__label')?.textContent?.trim() === label,
    )!;

  return { fixture, root, row };
}

describe('MudTree on the server', () => {
  afterEach(() => vi.restoreAllMocks());

  // The CDK tree renders its rows during change detection with no browser APIs,
  // so the server HTML must already carry the tree semantics and the row anatomy.
  it('serializes the tree semantics, the rows and the chevron', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { root, row } = await renderOnServer();

    expect(root.querySelector('mud-tree')?.getAttribute('role')).toBe('tree');
    expect(root.querySelector('mud-tree')?.hasAttribute('aria-multiselectable')).toBe(false);
    // Collapsed children are not rendered on the server either.
    expect(root.querySelectorAll('.mud-tree-node').length).toBe(3);
    expect(row('Home').getAttribute('role')).toBe('treeitem');
    expect(row('Home').getAttribute('aria-level')).toBe('1');
    expect(row('Home').getAttribute('aria-current')).toBe('page');
    expect(row('Home').getAttribute('href')).toBe('/home');
    expect(row('Services').getAttribute('aria-expanded')).toBe('false');
    expect(row('Services').querySelector('.mud-tree-item__toggle svg')).not.toBeNull();
    expect(row('Services').querySelector('.mud-tree-item__toggle')?.getAttribute('data-direction')).toBe('down');
    expect(row('Archive').getAttribute('aria-disabled')).toBe('true');
    // The named tree warns about nothing on the server.
    expect(warn).not.toHaveBeenCalled();
  });

  it('serializes expanded children with their level and indent', async () => {
    const { fixture, row } = await renderOnServer();
    const tree = fixture.debugElement.query((de) => de.componentInstance instanceof MudTree).componentInstance as MudTree<NavNode>;

    tree.expand(DATA[1]);
    await fixture.whenStable();

    expect(row('Passport').getAttribute('aria-level')).toBe('2');
    expect(row('Passport').style.getPropertyValue('--mud-tree-item-depth')).toBe('1');
    expect(row('Services').getAttribute('aria-expanded')).toBe('true');
    expect(row('Services').querySelector('.mud-tree-item__toggle')?.getAttribute('data-direction')).toBe('up');
  });

  it('serializes a multiple tree with aria-selected instead of aria-current', async () => {
    const { fixture, root, row } = await renderOnServer();

    fixture.componentInstance.multiple.set(true);
    await fixture.whenStable();

    expect(root.querySelector('mud-tree')?.getAttribute('aria-multiselectable')).toBe('true');
    expect(row('Home').getAttribute('aria-selected')).toBe('true');
    expect(row('Home').hasAttribute('aria-current')).toBe(false);
  });
});
