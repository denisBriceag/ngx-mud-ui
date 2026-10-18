import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, RouterLink, RouterLinkActive, withHashLocation } from '@angular/router';
import { expect, userEvent, within } from 'storybook/test';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudIconName } from 'ngx-mud-ui/icons';
import { calendar, group, MudIconComponent, provideMudIcons, receiptCheck } from 'ngx-mud-ui/icons';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

// Every story renders a real @Component and shows that same component under
// "Show code". The template constants below are shared by the rendered class
// and its snippet, so the two cannot drift apart. Links use real routerLink +
// routerLinkActive, backed by a hash-location router (see meta) so clicks
// navigate inside the Storybook frame.

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

const childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
const isSection = (_: number, node: NavNode): boolean => !node.url;

const BT = '`';

const indent = (text: string, spaces: number): string =>
  text
    .trim()
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');

interface SnippetOptions {
  selector: string;
  className: string;
  template: string;
  /** Class body, already formatted (2-space indented by the helper). */
  body: string;
  /** Top-level code between the imports and the @Component (interfaces, data). */
  before?: string;
  router?: boolean;
  icons?: boolean;
  button?: boolean;
  styles?: string;
  tag?: boolean;
  /** Extra '@angular/core' symbols (e.g. signal). */
  core?: string[];
}

const componentSource = (o: SnippetOptions): string => {
  const imports = ['MudTree', 'MudTreeNode', 'MudTreeNodeDef'];

  if (o.icons) imports.push('MudIconComponent');

  if (o.router) imports.push('RouterLink', 'RouterLinkActive');

  if (o.button) imports.push('MudButton');

  if (o.tag) imports.push('MudTag');

  const badge = o.template.includes('<mud-badge');

  if (badge) imports.push('MudBadge');

  return [
    `import { ${['ChangeDetectionStrategy', 'Component', ...(o.core ?? [])].join(', ')} } from '@angular/core';`,
    ...(o.router ? ["import { RouterLink, RouterLinkActive } from '@angular/router';"] : []),
    ...(badge ? ["import { MudBadge } from 'ngx-mud-ui/badge';"] : []),
    ...(o.button ? ["import { MudButton } from 'ngx-mud-ui/button';"] : []),
    ...(o.tag ? ["import { MudTag } from 'ngx-mud-ui/tag';"] : []),
    ...(o.icons ? ["import { MudIconComponent, type MudIconName } from 'ngx-mud-ui/icons';"] : []),
    "import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';",
    '',
    ...(o.before ? [o.before.trim(), ''] : []),
    '@Component({',
    `  selector: '${o.selector}',`,
    `  imports: [${imports.join(', ')}],`,
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    `  template: ${BT}`,
    indent(o.template, 4),
    `  ${BT},`,
    ...(o.styles ? [`  styles: '${o.styles}',`] : []),
    '})',
    `export class ${o.className} {`,
    indent(o.body, 2),
    '}',
  ].join('\n');
};

const NAV_NODE_INTERFACE = `
interface NavNode<D = unknown> {
  label: string;
  /** Pages have a url; nodes without one are sections that only open and close. */
  url?: string;
  icon?: MudIconName;
  count?: number;
  children?: NavNode<D>[];
  /** Anything your app needs on the node: ids, permissions, analytics keys… */
  data?: D;
}`;

const ACCESSORS = `
readonly childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
readonly isSection = (_: number, node: NavNode): boolean => !node.url;`;

/* ------------------------------------------------------------------ */
/* Navigation tree: links for pages, buttons for sections.             */
/* ------------------------------------------------------------------ */

const NAV_TEMPLATE = `
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
    @if (node.icon) { <mud-icon icon [name]="node.icon" [scale]="20" /> }
    @if (node.icon) { <mud-icon selectedIcon [name]="node.icon" variant="filled" [scale]="20" /> }
    {{ node.label }}
    @if (node.count) { <mud-badge trailing [count]="node.count" variant="neutral" size="xl" /> }
  </a>
  <!-- A section: no url, a click opens and closes it. -->
  <button mud-tree-node type="button" *mudTreeNodeDef="let node of nav; when: isSection" [isExpandable]="true">
    @if (node.icon) { <mud-icon icon [name]="node.icon" [scale]="20" /> }
    {{ node.label }}
    @if (node.count) { <mud-badge trailing [count]="node.count" variant="neutral" size="xl" /> }
  </button>
</mud-tree>`;

const NAV_IMPORTS = [MudTree, MudTreeNode, MudTreeNodeDef, MudIconComponent, RouterLink, RouterLinkActive, MudBadge];

const NAVIGATION_DATA: NavNode[] = [
  { label: 'Persoane', url: '/navigare/persoane', icon: 'group' },
  {
    label: 'Documente',
    icon: 'receipt-check',
    children: [
      { label: 'Pașaport', url: '/navigare/pasaport', icon: 'receipt-check' },
      { label: 'Buletin', url: '/navigare/buletin', icon: 'receipt-check', count: 2 },
    ],
  },
  { label: 'Programări', url: '/navigare/programari', icon: 'calendar', count: 3 },
];

const NAVIGATION_DATA_SOURCE = `
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
];`;

/** Story-only host for the Navigation story. */
@Component({
  selector: 'mud-tree-story-navigation',
  imports: NAV_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: NAV_TEMPLATE,
})
class TreeStoryNavigation {
  readonly nav = NAVIGATION_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const NAVIGATION_SOURCE = componentSource({
  selector: 'app-side-nav',
  className: 'SideNavComponent',
  template: NAV_TEMPLATE,
  before: `${NAV_NODE_INTERFACE}\n${NAVIGATION_DATA_SOURCE}`,
  body: `readonly nav = NAV;\n${ACCESSORS.trim()}`,
  router: true,
  icons: true,
});

/* ------------------------------------------------------------------ */
/* Nested: any depth, indent grows 32px per level.                     */
/* ------------------------------------------------------------------ */

const NESTED_DATA: NavNode[] = [
  {
    label: 'Servicii',
    children: [
      {
        label: 'Acte de identitate',
        children: [
          { label: 'Pașaport', url: '/imbricat/pasaport' },
          { label: 'Buletin', url: '/imbricat/buletin' },
        ],
      },
      { label: 'Transport', url: '/imbricat/transport' },
    ],
  },
  { label: 'Plăți', url: '/imbricat/plati' },
];

const NESTED_DATA_SOURCE = `
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
];`;

/** Story-only host for the Nested story. */
@Component({
  selector: 'mud-tree-story-nested',
  imports: NAV_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: NAV_TEMPLATE,
})
class TreeStoryNested {
  readonly nav = NESTED_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const NESTED_SOURCE = componentSource({
  selector: 'app-services-nav',
  className: 'ServicesNavComponent',
  template: NAV_TEMPLATE,
  before: `${NAV_NODE_INTERFACE}\n${NESTED_DATA_SOURCE}`,
  body: `readonly nav = SERVICES;\n${ACCESSORS.trim()}`,
  router: true,
  icons: true,
});

/* ------------------------------------------------------------------ */
/* Badge + chevron on the same row.                                    */
/* ------------------------------------------------------------------ */

const BADGE_DATA: NavNode[] = [
  {
    label: 'Mesaje',
    icon: 'receipt-check',
    count: 4,
    children: [
      { label: 'Necitite', url: '/insigna/necitite' },
      { label: 'Arhivă', url: '/insigna/arhiva' },
    ],
  },
];

const BADGE_DATA_SOURCE = `
const INBOX: NavNode[] = [
  {
    label: 'Mesaje',
    icon: 'receipt-check',
    count: 4,
    children: [
      { label: 'Necitite', url: '/mesaje/necitite' },
      { label: 'Arhivă', url: '/mesaje/arhiva' },
    ],
  },
];`;

/** Story-only host for the BadgeAndChevron story. */
@Component({
  selector: 'mud-tree-story-badge',
  imports: NAV_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: NAV_TEMPLATE,
})
class TreeStoryBadge {
  readonly nav = BADGE_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const BADGE_SOURCE = componentSource({
  selector: 'app-inbox-nav',
  className: 'InboxNavComponent',
  template: NAV_TEMPLATE,
  before: `${NAV_NODE_INTERFACE}\n${BADGE_DATA_SOURCE}`,
  body: `readonly nav = INBOX;\n${ACCESSORS.trim()}`,
  router: true,
  icons: true,
});

/* ------------------------------------------------------------------ */
/* Page parents: a link that also has children.                        */
/* ------------------------------------------------------------------ */

const PAGE_PARENT_DATA: NavNode[] = [
  {
    label: 'Setări',
    url: '/parinte/setari',
    children: [
      { label: 'Profil', url: '/parinte/setari/profil' },
      { label: 'Securitate', url: '/parinte/setari/securitate' },
    ],
  },
];

const PAGE_PARENT_DATA_SOURCE = `
const SETTINGS: NavNode[] = [
  {
    // Has both a url and children: clicking navigates AND opens it; only the chevron closes it.
    label: 'Setări',
    url: '/setari',
    children: [
      { label: 'Profil', url: '/setari/profil' },
      { label: 'Securitate', url: '/setari/securitate' },
    ],
  },
];`;

/** Story-only host for the PageParents story. */
@Component({
  selector: 'mud-tree-story-page-parents',
  imports: NAV_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: NAV_TEMPLATE,
})
class TreeStoryPageParents {
  readonly nav = PAGE_PARENT_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const PAGE_PARENT_SOURCE = componentSource({
  selector: 'app-settings-nav',
  className: 'SettingsNavComponent',
  template: NAV_TEMPLATE,
  before: `${NAV_NODE_INTERFACE}\n${PAGE_PARENT_DATA_SOURCE}`,
  body: `readonly nav = SETTINGS;\n${ACCESSORS.trim()}`,
  router: true,
  icons: true,
});

/* ------------------------------------------------------------------ */
/* Disabled: button/div hosts only.                                    */
/* ------------------------------------------------------------------ */

interface StepNode {
  label: string;
  locked?: boolean;
  children?: StepNode[];
}

const DISABLED_TEMPLATE = `
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
</mud-tree>`;

const STEPS: StepNode[] = [
  { label: 'Date personale' },
  { label: 'Documente', locked: true, children: [{ label: 'Pașaport' }, { label: 'Buletin' }] },
  { label: 'Programare' },
];

const DISABLED_SOURCE = componentSource({
  selector: 'app-request-steps',
  className: 'RequestStepsComponent',
  template: DISABLED_TEMPLATE,
  before: `
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
];`,
  body: `readonly steps = STEPS;
readonly childrenOf = (node: StepNode): StepNode[] => node.children ?? [];`,
});

/** Story-only host for the Disabled story. */
@Component({
  selector: 'mud-tree-story-disabled',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: DISABLED_TEMPLATE,
})
class TreeStoryDisabled {
  readonly steps = STEPS;
  readonly childrenOf = (node: StepNode): StepNode[] => node.children ?? [];
}

/* ------------------------------------------------------------------ */
/* Expand all / collapse all through the tree's exportAs.              */
/* ------------------------------------------------------------------ */

const EXPAND_ALL_STYLES = '.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }';

const EXPAND_ALL_TEMPLATE = `
<div class="toolbar">
  <button mudButton="outlined" type="button" (click)="tree.expandAll()">Expand all</button>
  <button mudButton="outlined" type="button" (click)="tree.collapseAll()">Collapse all</button>
</div>
<mud-tree #tree="mudTree" [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Servicii">
  <a mud-tree-node *mudTreeNodeDef="let node of nav" [routerLink]="node.url" routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive">
    {{ node.label }}
  </a>
  <button mud-tree-node type="button" *mudTreeNodeDef="let node of nav; when: isSection" [isExpandable]="true">
    {{ node.label }}
  </button>
</mud-tree>`;

const EXPAND_ALL_DATA: NavNode[] = [
  {
    label: 'Servicii',
    children: [
      {
        label: 'Acte de identitate',
        children: [
          { label: 'Pașaport', url: '/extins/pasaport' },
          { label: 'Buletin', url: '/extins/buletin' },
        ],
      },
      { label: 'Transport', url: '/extins/transport' },
    ],
  },
  { label: 'Plăți', url: '/extins/plati' },
];

/** Story-only host for the ExpandAll story. */
@Component({
  selector: 'mud-tree-story-expand-all',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink, RouterLinkActive, MudButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: EXPAND_ALL_TEMPLATE,
  styles: EXPAND_ALL_STYLES,
})
class TreeStoryExpandAll {
  readonly nav = EXPAND_ALL_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const EXPAND_ALL_SOURCE = componentSource({
  selector: 'app-services-nav',
  className: 'ServicesNavComponent',
  template: EXPAND_ALL_TEMPLATE,
  before: `
interface NavNode {
  label: string;
  url?: string;
  children?: NavNode[];
}
${NESTED_DATA_SOURCE}`,
  body: `readonly nav = SERVICES;\n${ACCESSORS.trim()}`,
  router: true,
  button: true,
  styles: EXPAND_ALL_STYLES,
});

/* ------------------------------------------------------------------ */
/* Multiple choice: sections count their chosen children.              */
/* ------------------------------------------------------------------ */

interface FilterNode {
  id: string;
  label: string;
  children?: FilterNode[];
}

const MULTIPLE_TEMPLATE = `
<!-- multiple: several rows can be chosen, announced with aria-selected. -->
<mud-tree [dataSource]="filters" [childrenAccessor]="childrenOf" multiple aria-label="Filtrează documentele">
  <!-- A section opens and closes; its badge counts the chosen children. -->
  <button mud-tree-node type="button" *mudTreeNodeDef="let node of filters; when: isSection" [isExpandable]="true">
    {{ node.label }}
    @if (chosenIn(node); as count) { <mud-badge trailing [count]="count" variant="brand" size="xl" /> }
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
</mud-tree>`;

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

const MULTIPLE_BODY = `
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
}`;

/** Story-only host for the MultipleChoice story. */
@Component({
  selector: 'mud-tree-story-multiple',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, MudBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: MULTIPLE_TEMPLATE,
})
class TreeStoryMultiple {
  readonly filters = FILTERS;
  readonly chosen = signal(new Set<string>(['passport', 'id-card']));
  readonly childrenOf = (node: FilterNode): FilterNode[] => node.children ?? [];
  readonly isSection = (_: number, node: FilterNode): boolean => !!node.children?.length;

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

const MULTIPLE_SOURCE = componentSource({
  selector: 'app-document-filters',
  className: 'DocumentFiltersComponent',
  template: MULTIPLE_TEMPLATE,
  core: ['signal'],
  before: `
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
];`,
  body: MULTIPLE_BODY,
});

/* ------------------------------------------------------------------ */
/* Custom data: your own fields on a node, used in the row and a handler. */
/* ------------------------------------------------------------------ */

interface PageInfo {
  id: string;
  permission?: 'admin' | 'user';
}

const CUSTOM_DATA_TEMPLATE = `
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
    @if (node.data?.permission === 'admin') { <mud-tag trailing size="small" color="brand">Admin</mud-tag> }
  </a>
  <button mud-tree-node type="button" *mudTreeNodeDef="let node of nav; when: isSection" [isExpandable]="true">
    {{ node.label }}
  </button>
</mud-tree>
@if (lastOpened(); as page) {
  <p class="last-opened">Last opened: {{ page.id }} ({{ page.permission ?? 'everyone' }})</p>
}`;

const CUSTOM_DATA: NavNode<PageInfo>[] = [
  { label: 'Panou', url: '/date/panou', data: { id: 'dashboard', permission: 'user' } },
  {
    label: 'Administrare',
    children: [
      { label: 'Utilizatori', url: '/date/utilizatori', data: { id: 'users', permission: 'admin' } },
      { label: 'Roluri', url: '/date/roluri', data: { id: 'roles', permission: 'admin' } },
      { label: 'Jurnal', url: '/date/jurnal', data: { id: 'audit-log' } },
    ],
  },
];

const CUSTOM_DATA_STYLES = '.last-opened { margin: 12px 24px 0; font-size: 14px; }';

/** Story-only host for the CustomData story. */
@Component({
  selector: 'mud-tree-story-custom-data',
  imports: [MudTree, MudTreeNode, MudTreeNodeDef, RouterLink, RouterLinkActive, MudTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: CUSTOM_DATA_TEMPLATE,
  styles: CUSTOM_DATA_STYLES,
})
class TreeStoryCustomData {
  readonly nav = CUSTOM_DATA;
  readonly lastOpened = signal<PageInfo | undefined>(undefined);
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;

  open(page: PageInfo | undefined): void {
    this.lastOpened.set(page);
  }
}

const CUSTOM_DATA_SOURCE = componentSource({
  selector: 'app-admin-nav',
  className: 'AdminNavComponent',
  template: CUSTOM_DATA_TEMPLATE,
  styles: CUSTOM_DATA_STYLES,
  core: ['signal'],
  router: true,
  tag: true,
  before: `
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
];`,
  body: `readonly nav = ADMIN_NAV;
readonly lastOpened = signal<PageInfo | undefined>(undefined);
readonly childrenOf = (node: NavNode<PageInfo>) => node.children ?? [];
readonly isSection = (_: number, node: NavNode<PageInfo>) => !node.url;

open(page: PageInfo | undefined): void {
  this.lastOpened.set(page);
}`,
});

// A fixed-width column, like the sidebar the tree will live in.
const frame = (body: string) => `<div style="width: 320px; border: 1px solid var(--mud-color-border-base-default)">${body}</div>`;

const meta: Meta<MudTree<NavNode>> = {
  title: 'Components/Tree',
  component: MudTree,
  decorators: [
    applicationConfig({
      providers: [
        provideMudIcons([group, receiptCheck, calendar]),
        // Story-only router: every path resolves, the hash keeps navigation inside the
        // Storybook frame, and the redirect makes the Navigation story open on a page.
        provideRouter(
          [
            { path: '', redirectTo: 'navigare/persoane', pathMatch: 'full' },
            { path: '**', children: [] },
          ],
          withHashLocation(),
        ),
      ],
    }),
    moduleMetadata({
      imports: [TreeStoryNavigation, TreeStoryNested, TreeStoryBadge, TreeStoryPageParents, TreeStoryDisabled, TreeStoryExpandAll, TreeStoryMultiple, TreeStoryCustomData],
    }),
  ],
  parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<MudTree<NavNode>>;

/** A sidebar navigation: sections are buttons that toggle, pages are links, and the current page gets the bar. */
export const Navigation: Story = {
  play: async ({ canvasElement }) => {
    const row = await within(canvasElement).findByRole('treeitem', { name: /Persoane/ });

    await expect(row.querySelector('.mud-tree-item__icon mud-icon')).not.toBeNull();
    await expect(row.querySelector('.mud-tree-item__label mud-icon')).toBeNull();
  },
  parameters: { docs: { source: { language: 'ts', code: NAVIGATION_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-navigation />') }),
};

/** Any depth: each level indents 32px more (24, 56, 88…). */
export const Nested: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('treeitem', { name: /Servicii/ }));
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Acte de identitate/ }));
    await expect(await canvas.findByText('Pașaport')).toBeVisible();
  },
  parameters: { docs: { source: { language: 'ts', code: NESTED_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-nested />') }),
};

/** A badge and the chevron sit 10px apart. */
export const BadgeAndChevron: Story = {
  parameters: { docs: { source: { language: 'ts', code: BADGE_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-badge />') }),
};

/** A parent that is also a page: clicking navigates and opens it, and only the chevron closes it. */
export const PageParents: Story = {
  parameters: { docs: { source: { language: 'ts', code: PAGE_PARENT_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-page-parents />') }),
};

/** Disabled nodes stay in the tree but are skipped by the arrow keys. Only button/div hosts can be disabled. */
export const Disabled: Story = {
  parameters: { docs: { source: { language: 'ts', code: DISABLED_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-disabled />') }),
};

/** `expandAll()` / `collapseAll()` come from CdkTree, reached through `#tree="mudTree"`. */
export const ExpandAll: Story = {
  parameters: { docs: { source: { language: 'ts', code: EXPAND_ALL_SOURCE } } },
  render: () => ({ template: '<mud-tree-story-expand-all />' }),
};

/** Several rows can be chosen (`multiple`); each section's badge counts its chosen children. */
export const MultipleChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('treeitem', { name: /Documente/ });

    await expect(section.querySelector('.badge')?.textContent?.trim()).toBe('2');
    await userEvent.click(section);
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Permis de conducere/ }));
    await expect(section.querySelector('.badge')?.textContent?.trim()).toBe('3');
    await expect(await canvas.findByRole('treeitem', { name: /Permis de conducere/ })).toHaveAttribute('aria-selected', 'true');
  },
  parameters: { docs: { source: { language: 'ts', code: MULTIPLE_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-multiple />') }),
};

/** Your own fields on a node (`data`), used to show an Admin tag and passed to a click handler. */
export const CustomData: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('treeitem', { name: /Administrare/ }));
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Utilizatori/ }));
    await expect(await canvas.findByText('Last opened: users (admin)')).toBeVisible();
  },
  parameters: { docs: { source: { language: 'ts', code: CUSTOM_DATA_SOURCE } } },
  render: () => ({ template: frame('<mud-tree-story-custom-data />') }),
};
