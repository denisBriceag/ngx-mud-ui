import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { ChangeDetectionStrategy, Component, input, linkedSignal, signal } from '@angular/core';
import { provideRouter, RouterLink, RouterLinkActive, withHashLocation } from '@angular/router';
import { expect, userEvent, within } from 'storybook/test';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudChip } from 'ngx-mud-ui/chip';
import type { MudIconName } from 'ngx-mud-ui/icons';
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
  suitcase2,
} from 'ngx-mud-ui/icons';
import {
  MudSidebar,
  MudSidebarContent,
  MudSidebarGroup,
  MudSidebarHeader,
  MudSidebarItem,
  MudSidebarLayout,
  MudSidebarToggle,
} from 'ngx-mud-ui/sidebar';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';
import { MudTree, MudTreeNode, MudTreeNodeDef } from 'ngx-mud-ui/tree';

// Every story renders a real @Component and shows that same component under
// "Show code". The template constants below are shared by the rendered class
// and its snippet, so the two cannot drift apart. Links use real routerLink +
// routerLinkActive, backed by a hash-location router (see meta) so clicks
// navigate inside the Storybook frame.

const BT = '`';

const indent = (text: string, spaces: number): string =>
  text
    .trim()
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');

// Where each symbol a snippet imports comes from, in import-line order.
const MODULE_OF: Record<string, string> = {
  RouterLink: '@angular/router',
  RouterLinkActive: '@angular/router',
  MudAvatar: 'ngx-mud-ui/avatar',
  MudButton: 'ngx-mud-ui/button',
  MudIconButton: 'ngx-mud-ui/button',
  MudChip: 'ngx-mud-ui/chip',
  MudIconComponent: 'ngx-mud-ui/icons',
  MudSidebar: 'ngx-mud-ui/sidebar',
  MudSidebarHeader: 'ngx-mud-ui/sidebar',
  MudSidebarGroup: 'ngx-mud-ui/sidebar',
  MudSidebarItem: 'ngx-mud-ui/sidebar',
  MudSidebarToggle: 'ngx-mud-ui/sidebar',
  MudSidebarLayout: 'ngx-mud-ui/sidebar',
  MudSidebarContent: 'ngx-mud-ui/sidebar',
  MudTabGroup: 'ngx-mud-ui/tabs',
  MudTab: 'ngx-mud-ui/tabs',
  MudTree: 'ngx-mud-ui/tree',
  MudTreeNode: 'ngx-mud-ui/tree',
  MudTreeNodeDef: 'ngx-mud-ui/tree',
};

interface SnippetOptions {
  selector: string;
  className: string;
  template: string;
  imports: string[];
  /** Class body, already formatted (2-space indented by the helper). */
  body?: string;
  /** Top-level code between the imports and the @Component (interfaces, data). */
  before?: string;
  styles?: string;
  /** Extra '@angular/core' symbols (e.g. signal). */
  core?: string[];
  /** Extra type-only import from 'ngx-mud-ui/icons'. */
  iconType?: boolean;
}

const componentSource = (o: SnippetOptions): string => {
  const byModule = new Map<string, string[]>();

  for (const symbol of o.imports) {
    const from = MODULE_OF[symbol];

    byModule.set(from, [...(byModule.get(from) ?? []), symbol]);
  }

  const moduleLines = [...byModule].map(([from, symbols]) => {
    const list = from === 'ngx-mud-ui/icons' && o.iconType ? [...symbols, 'type MudIconName'] : symbols;

    return `import { ${list.join(', ')} } from '${from}';`;
  });

  return [
    `import { ${['ChangeDetectionStrategy', 'Component', ...(o.core ?? [])].join(', ')} } from '@angular/core';`,
    ...moduleLines,
    '',
    ...(o.before ? [o.before.trim(), ''] : []),
    '@Component({',
    `  selector: '${o.selector}',`,
    `  imports: [${o.imports.join(', ')}],`,
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    `  template: ${BT}`,
    indent(o.template, 4),
    `  ${BT},`,
    ...(o.styles ? [`  styles: ${BT}`, indent(o.styles, 4), `  ${BT},`] : []),
    '})',
    ...(o.body ? [`export class ${o.className} {`, indent(o.body, 2), '}'] : [`export class ${o.className} {}`]),
  ].join('\n');
};

const source = (o: SnippetOptions) => ({ docs: { source: { language: 'ts', code: componentSource(o) } } });

const SIDEBAR_SYMBOLS = ['MudSidebar', 'MudSidebarGroup', 'MudSidebarItem', 'MudIconComponent', 'RouterLink'];
const SIDEBAR_IMPORTS = [MudSidebar, MudSidebarGroup, MudSidebarItem, MudIconComponent, RouterLink];
const TOGGLE_SYMBOLS = ['MudSidebarHeader', 'MudSidebarToggle', 'MudIconButton'];
const TOGGLE_IMPORTS = [MudSidebarHeader, MudSidebarToggle, MudIconButton];

// The toggle sits at the end of the header row while extended; the compact rail centres it.
const TOGGLE_STYLES = '.mud-sidebar:not(.mud-sidebar--compact) .toggle-row { align-items: flex-end; }';

// The toggle lives outside any @if, so it keeps focus when the rail swaps. Its name
// stays the same; aria-expanded says which way it will go.
const TOGGLE = `
<div mudSidebarHeader class="toggle-row">
  <button mudIconButton mudSidebarToggle aria-label="Menu">
    <mud-icon name="sidebar" [scale]="20" />
  </button>
</div>`;

/* ------------------------------------------------------------------ */
/* Upstream's two groups.                                              */
/* ------------------------------------------------------------------ */

// Every row the compact rail shows needs an icon: it is all the rail draws.
const defaultGroups = (iconsEverywhere: boolean): string => `
<mud-sidebar-group heading="Heading">
  <!-- selected marks the current page; in an app bind it to routerLinkActive (see Mpower page). -->
  <a mud-sidebar-item routerLink="/overview" selected>
    <mud-icon icon name="group" [scale]="20" />
    <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
    Overview
  </a>
  <a mud-sidebar-item routerLink="/analytics"><mud-icon icon name="chart" [scale]="20" />Analytics</a>
  <a mud-sidebar-item routerLink="/documents"><mud-icon icon name="document" [scale]="20" />Documents</a>
  <a mud-sidebar-item routerLink="/search"><mud-icon icon name="search" [scale]="20" />Search</a>
  <a mud-sidebar-item routerLink="/filters"><mud-icon icon name="filter" [scale]="20" />Filters</a>
  <a mud-sidebar-item routerLink="/settings"><mud-icon icon name="settings" [scale]="20" />Settings</a>
</mud-sidebar-group>
<mud-sidebar-group heading="Heading">
  <a mud-sidebar-item routerLink="/downloads">${iconsEverywhere ? '<mud-icon icon name="download" [scale]="20" />' : ''}Downloads</a>
  <a mud-sidebar-item routerLink="/archive">${iconsEverywhere ? '<mud-icon icon name="suitcase-2" [scale]="20" />' : ''}Archive</a>
</mud-sidebar-group>`;

const DEFAULT_TEMPLATE = `
<mud-sidebar aria-label="Main navigation">
${indent(defaultGroups(false), 2)}
</mud-sidebar>`;

/** Story-only host for the Default story. */
@Component({
  selector: 'mud-sidebar-story-default',
  imports: SIDEBAR_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: DEFAULT_TEMPLATE,
})
class SidebarStoryDefault {}

/* ------------------------------------------------------------------ */
/* Compact: the same groups as a rail, with a toggle.                  */
/* ------------------------------------------------------------------ */

const COMPACT_TEMPLATE = `
<mud-sidebar #sb="mudSidebar" aria-label="Main navigation" [(collapsed)]="collapsed">
${indent(TOGGLE, 2)}
${indent(defaultGroups(true), 2)}
</mud-sidebar>`;

/** Story-only host for the Compact story. */
@Component({
  selector: 'mud-sidebar-story-compact',
  imports: [...SIDEBAR_IMPORTS, ...TOGGLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: COMPACT_TEMPLATE,
  styles: TOGGLE_STYLES,
})
class SidebarStoryCompact {
  readonly collapsed = signal(true);
}

/* ------------------------------------------------------------------ */
/* Playground: collapsed, the group heading and divider, all bound.    */
/* ------------------------------------------------------------------ */

type DividerArg = 'unset' | 'true' | 'false';

interface PlaygroundArgs {
  collapsed: boolean;
  heading: string;
  divider: DividerArg;
}

const dividerValue = (arg: DividerArg | undefined): boolean | undefined =>
  arg === 'true' ? true : arg === 'false' ? false : undefined;

const dividerAttr = (arg: DividerArg | undefined): string =>
  arg === 'true' || arg === 'false' ? ` [divider]="${arg}"` : '';

const PLAYGROUND_ROWS = `
<a mud-sidebar-item routerLink="/overview" selected>
  <mud-icon icon name="group" [scale]="20" />
  <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
  Overview
</a>
<a mud-sidebar-item routerLink="/analytics"><mud-icon icon name="chart" [scale]="20" />Analytics</a>
<a mud-sidebar-item routerLink="/documents"><mud-icon icon name="document" [scale]="20" />Documents</a>`;

const escapeAttr = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const playgroundSource = (args: PlaygroundArgs): string =>
  componentSource({
    selector: 'app-side-nav',
    className: 'SideNavComponent',
    imports: [...SIDEBAR_SYMBOLS, ...TOGGLE_SYMBOLS],
    core: ['signal'],
    styles: TOGGLE_STYLES,
    template: `
<mud-sidebar #sb="mudSidebar" aria-label="Main navigation" [(collapsed)]="collapsed">
${indent(TOGGLE, 2)}
  <mud-sidebar-group heading="${escapeAttr(args.heading ?? '')}"${dividerAttr(args.divider)}>
${indent(PLAYGROUND_ROWS, 4)}
  </mud-sidebar-group>
</mud-sidebar>`,
    body: `readonly collapsed = signal(${args.collapsed});`,
  });

const PLAYGROUND_TEMPLATE = `
<mud-sidebar #sb="mudSidebar" aria-label="Main navigation" [(collapsed)]="state">
${indent(TOGGLE, 2)}
  <mud-sidebar-group [heading]="heading()" [divider]="divider()">
${indent(PLAYGROUND_ROWS, 4)}
  </mud-sidebar-group>
</mud-sidebar>`;

/** Story-only host for the Playground: the controls own `collapsed` and the group `heading` and `divider`. */
@Component({
  selector: 'mud-sidebar-story-playground',
  imports: [...SIDEBAR_IMPORTS, ...TOGGLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: PLAYGROUND_TEMPLATE,
  styles: TOGGLE_STYLES,
})
class SidebarStoryPlayground {
  readonly collapsed = input(false);
  readonly heading = input('Heading');
  readonly divider = input<boolean | undefined>(undefined);
  /** Follows the control, and the toggle can still flip it in between. */
  protected readonly state = linkedSignal(() => this.collapsed());
}

/* ------------------------------------------------------------------ */
/* Mpower page: the reference screenshots, rebuilt.                    */
/* ------------------------------------------------------------------ */

interface Filter {
  path: string;
  icon: MudIconName;
  label: string;
  count: number;
}

const FILTERS: Filter[] = [
  { path: '/toate', icon: 'page-text', label: 'Toate împuternicirile', count: 1 },
  { path: '/schite', icon: 'edit', label: 'Schițe', count: 1 },
  { path: '/acordate', icon: 'page-upload', label: 'Acordate', count: 1 },
  { path: '/primite', icon: 'page-download', label: 'Primite', count: 1 },
  { path: '/cosemnate', icon: 'people', label: 'Cosemnate', count: 1 },
];

const MPOWER_TEMPLATE = `
<mud-sidebar-layout>
  <mud-sidebar #sb="mudSidebar" aria-label="Împuterniciri" [(collapsed)]="collapsed">
    <div mudSidebarHeader>
      <!-- The toggle stays outside the @if blocks so it keeps focus when the rail swaps. -->
      <div class="mpower-profile">
        @if (!sb.compact()) {
          <mud-avatar name="Anastasia Cojocaru" />
          <div class="mpower-profile__text"><strong>Anastasia Cojocaru</strong><span>IDNP 12012092309223019</span></div>
        }
        <button mudIconButton mudSidebarToggle aria-label="Meniu">
          <mud-icon name="sidebar" [scale]="20" />
        </button>
      </div>
      @if (sb.compact()) {
        <mud-avatar name="Anastasia Cojocaru" />
        <button mudButton shape="circular" size="medium" class="mpower-new" aria-label="Împuternicire nouă">
          <mud-icon name="plus-large" [scale]="20" />
        </button>
      } @else {
        <button mudButton size="medium" fullWidth>Împuternicire nouă</button>
      }
    </div>
    <!-- Swap on sb.compact(), not collapsed(): below 768px the rail is always drawn extended. -->
    <mud-sidebar-group heading="Filtrare împuterniciri după:" [divider]="sb.compact()">
      @for (f of filters; track f.path) {
        <a mud-sidebar-item [routerLink]="f.path" routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive">
          <mud-icon icon [name]="f.icon" [scale]="20" />
          {{ f.label }}
          <span class="badge badge--xl badge--solid-neutral" trailing>{{ f.count }}</span>
        </a>
      }
    </mud-sidebar-group>
    <mud-sidebar-group>
      <a mud-sidebar-item routerLink="/jurnal"><mud-icon icon name="history" [scale]="20" />Jurnal de acțiuni</a>
    </mud-sidebar-group>
    <mud-sidebar-group heading="Contacte" [divider]="sb.compact()">
      @if (sb.compact()) {
        <div class="mpower-contacts-rail">
          <button mudIconButton aria-label="Caută contacte"><mud-icon name="search" [scale]="20" /></button>
          <div class="avatar-stack"><mud-avatar name="Vladimir Odobescu" size="small" /><mud-avatar name="Andrei Codreanu" size="small" /></div>
        </div>
      } @else {
        <div class="mpower-chips">
          <mud-chip size="small" [selected]="true">Toți</mud-chip>
          <mud-chip size="small">Fizice</mud-chip>
          <mud-chip size="small">Juridice</mud-chip>
          <button mudIconButton size="small" aria-label="Caută contacte"><mud-icon name="search" [scale]="16" /></button>
        </div>
        @for (c of contacts; track c) {
          <div class="mpower-contact">
            <mud-avatar [name]="c" size="small" />
            <span class="mpower-contact__name">{{ c }}</span>
            <button mudIconButton size="small" [attr.aria-label]="'Acțiuni pentru ' + c"><mud-icon name="more-vertical" [scale]="20" /></button>
          </div>
        }
      }
    </mud-sidebar-group>
  </mud-sidebar>
  <main mudSidebarContent>
    <mud-tab-group size="sm" aria-label="Împuternicire">
      @for (tab of tabs; track tab) {
        <mud-tab [label]="tab">
          <div class="mpower-cards"><div class="mpower-card"></div><div class="mpower-card"></div><div class="mpower-card"></div></div>
        </mud-tab>
      }
    </mud-tab-group>
  </main>
</mud-sidebar-layout>`;

// Page content only: the profile, the contacts and the grey cards are the app's, not the sidebar's.
const MPOWER_STYLES = `
:host { display: block; padding-block: 40px; }
.mpower-profile { display: flex; align-items: center; gap: 12px; }
.mud-sidebar--compact .mpower-profile { justify-content: center; }
.mpower-profile__text { display: flex; flex: 1; flex-direction: column; min-width: 0; color: var(--color-text-base-tertiary); font-size: 14px; line-height: 20px; }
.mpower-profile__text strong { color: var(--color-text-base-default); font-size: 16px; font-weight: 500; line-height: 24px; }
.mud-btn.mpower-new { width: 40px; min-width: 40px; padding: 0; }
.mpower-chips { display: flex; align-items: center; gap: 8px; padding: 0 24px 12px; }
.mpower-contact { display: flex; align-items: center; gap: 12px; padding: 8px 24px; color: var(--color-text-base-default); font-size: 14px; line-height: 20px; }
.mpower-contact__name { flex: 1; font-weight: 500; }
.mpower-contacts-rail { display: flex; flex-direction: column; align-items: center; gap: 16px; padding-top: 16px; }
.mpower-contacts-rail .avatar-stack { flex-direction: column; }
.mpower-contacts-rail .avatar-stack .avatar { margin: -10px 0 0; }
.mpower-contacts-rail .avatar-stack .avatar:first-child { margin-top: 0; }
.mpower-cards { display: flex; flex-direction: column; gap: 16px; padding-top: 24px; }
.mpower-card { height: 280px; border-radius: 16px; background: var(--color-background-base-secondary); }`;

const MPOWER_TABS = ['Detalii', 'Acțiuni', 'Cosemnatari', 'Evenimente', 'Info utilă'];
const MPOWER_CONTACTS = ['Vladimir Odobescu', 'Andrei Codreanu'];

const MPOWER_IMPORTS = [
  MudSidebarLayout,
  MudSidebar,
  MudSidebarHeader,
  MudSidebarGroup,
  MudSidebarItem,
  MudSidebarToggle,
  MudSidebarContent,
  MudAvatar,
  MudButton,
  MudIconButton,
  MudChip,
  MudIconComponent,
  MudTabGroup,
  MudTab,
  RouterLink,
  RouterLinkActive,
];

/** Story-only host for the Mpower page story. */
@Component({
  selector: 'mud-sidebar-story-mpower',
  imports: MPOWER_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: MPOWER_TEMPLATE,
  styles: MPOWER_STYLES,
})
class SidebarStoryMpower {
  readonly collapsed = signal(false);
  readonly filters = FILTERS;
  readonly contacts = MPOWER_CONTACTS;
  readonly tabs = MPOWER_TABS;
}

const MPOWER_SOURCE: SnippetOptions = {
  selector: 'app-mpower-page',
  className: 'MpowerPageComponent',
  template: MPOWER_TEMPLATE,
  styles: MPOWER_STYLES,
  core: ['signal'],
  iconType: true,
  imports: [
    'MudSidebarLayout',
    'MudSidebar',
    'MudSidebarHeader',
    'MudSidebarGroup',
    'MudSidebarItem',
    'MudSidebarToggle',
    'MudSidebarContent',
    'MudAvatar',
    'MudButton',
    'MudIconButton',
    'MudChip',
    'MudIconComponent',
    'MudTabGroup',
    'MudTab',
    'RouterLink',
    'RouterLinkActive',
  ],
  before: `
interface Filter {
  path: string;
  icon: MudIconName;
  label: string;
  count: number;
}

const FILTERS: Filter[] = [
  { path: '/toate', icon: 'page-text', label: 'Toate împuternicirile', count: 1 },
  { path: '/schite', icon: 'edit', label: 'Schițe', count: 1 },
  { path: '/acordate', icon: 'page-upload', label: 'Acordate', count: 1 },
  { path: '/primite', icon: 'page-download', label: 'Primite', count: 1 },
  { path: '/cosemnate', icon: 'people', label: 'Cosemnate', count: 1 },
];`,
  body: `readonly collapsed = signal(false);
readonly filters = FILTERS;
readonly contacts = ['Vladimir Odobescu', 'Andrei Codreanu'];
readonly tabs = ['Detalii', 'Acțiuni', 'Cosemnatari', 'Evenimente', 'Info utilă'];`,
};

/* ------------------------------------------------------------------ */
/* With tree: nesting is a mud-tree inside a group.                    */
/* ------------------------------------------------------------------ */

interface NavNode {
  label: string;
  /** Pages have a url; nodes without one are sections that only open and close. */
  url?: string;
  icon?: MudIconName;
  children?: NavNode[];
}

const childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
const isSection = (_: number, node: NavNode): boolean => !node.url;

const TREE_DATA: NavNode[] = [
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

const TREE_TEMPLATE = `
<mud-sidebar #sb="mudSidebar" aria-label="Main navigation" [(collapsed)]="collapsed">
${indent(TOGGLE, 2)}
  <mud-sidebar-group heading="Services">
    <!-- In the rail only the top level shows; opening a section expands the sidebar first. -->
    <mud-tree [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Services">
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
        {{ node.label }}
      </a>
      <button mud-tree-node type="button" *mudTreeNodeDef="let node of nav; when: isSection" [isExpandable]="true">
        @if (node.icon) { <mud-icon icon [name]="node.icon" [scale]="20" /> }
        {{ node.label }}
      </button>
    </mud-tree>
  </mud-sidebar-group>
  <mud-sidebar-group>
    <a mud-sidebar-item routerLink="/settings"><mud-icon icon name="settings" [scale]="20" />Settings</a>
  </mud-sidebar-group>
</mud-sidebar>`;

/** Story-only host for the With tree story. */
@Component({
  selector: 'mud-sidebar-story-tree',
  imports: [...SIDEBAR_IMPORTS, ...TOGGLE_IMPORTS, MudTree, MudTreeNode, MudTreeNodeDef, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TREE_TEMPLATE,
  styles: TOGGLE_STYLES,
})
class SidebarStoryTree {
  readonly collapsed = signal(true);
  readonly nav = TREE_DATA;
  readonly childrenOf = childrenOf;
  readonly isSection = isSection;
}

const TREE_SOURCE: SnippetOptions = {
  selector: 'app-side-nav',
  className: 'SideNavComponent',
  template: TREE_TEMPLATE,
  styles: TOGGLE_STYLES,
  core: ['signal'],
  iconType: true,
  imports: [...SIDEBAR_SYMBOLS, 'RouterLinkActive', ...TOGGLE_SYMBOLS, 'MudTree', 'MudTreeNode', 'MudTreeNodeDef'],
  before: `
interface NavNode {
  label: string;
  url?: string;
  icon?: MudIconName;
  children?: NavNode[];
}

const NAV: NavNode[] = [
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
];`,
  body: `readonly collapsed = signal(true);
readonly nav = NAV;
readonly childrenOf = (node: NavNode): NavNode[] => node.children ?? [];
readonly isSection = (_: number, node: NavNode): boolean => !node.url;`,
};

/* ------------------------------------------------------------------ */
/* States.                                                             */
/* ------------------------------------------------------------------ */

const STATES_TEMPLATE = `
<mud-sidebar aria-label="Row states">
  <mud-sidebar-group heading="States">
    <!-- Hover and Tab to the first row to see those states. -->
    <a mud-sidebar-item routerLink="/states/default"><mud-icon icon name="group" [scale]="20" />Default</a>
    <a mud-sidebar-item routerLink="/states/selected" selected>
      <mud-icon icon name="group" [scale]="20" />
      <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
      Selected
    </a>
    <!-- Only a button can be disabled; a link cannot. -->
    <button mud-sidebar-item type="button" disabled><mud-icon icon name="settings" [scale]="20" />Disabled</button>
    <a mud-sidebar-item routerLink="/states/secondary">
      <mud-icon icon name="document" [scale]="20" />
      Secondary label
      <span secondaryLabel>12 new</span>
    </a>
    <!-- ngx-mud-ui Badge, inline form: badge--xl is the 24px size (see Components/Badge). -->
    <a mud-sidebar-item routerLink="/states/count">
      <mud-icon icon name="chart" [scale]="20" />
      Neutral badge
      <span trailing class="badge badge--xl badge--solid-neutral">9</span>
    </a>
    <a mud-sidebar-item routerLink="/states/notifications">
      <mud-icon icon name="filter" [scale]="20" />
      Notification badge
      <span trailing class="badge badge--xl badge--solid-danger">3</span>
    </a>
  </mud-sidebar-group>
</mud-sidebar>`;

/** Story-only host for the States story. */
@Component({
  selector: 'mud-sidebar-story-states',
  imports: SIDEBAR_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: STATES_TEMPLATE,
})
class SidebarStoryStates {}

/* ------------------------------------------------------------------ */
/* Meta.                                                               */
/* ------------------------------------------------------------------ */

// Room around a standalone sidebar so its 1px outer border shows.
const frame = (body: string) => `<div style="padding: 16px">${body}</div>`;

type SidebarArgs = MudSidebar & PlaygroundArgs;

const meta: Meta<SidebarArgs> = {
  title: 'Components/Sidebar',
  component: MudSidebar,
  subcomponents: {
    MudSidebarGroup,
    MudSidebarItem,
    MudSidebarHeader,
    MudSidebarToggle,
    MudSidebarLayout,
    MudSidebarContent,
  } as Meta<SidebarArgs>['subcomponents'],
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
          suitcase2,
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
        // Story-only router: every path resolves, the hash keeps navigation inside the
        // Storybook frame, and the redirect makes the Mpower page open on its first filter.
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
        SidebarStoryPlayground,
        SidebarStoryDefault,
        SidebarStoryMpower,
        SidebarStoryCompact,
        SidebarStoryTree,
        SidebarStoryStates,
      ],
    }),
  ],
  argTypes: {
    collapsed: { control: 'boolean' },
    heading: { control: 'text', description: 'Heading of the `mud-sidebar-group` (Playground only).' },
    divider: {
      control: 'select',
      options: ['unset', 'true', 'false'],
      description: '`divider` of the `mud-sidebar-group`; unset = automatic (Playground only, the group is first).',
    },
  } as Meta<SidebarArgs>['argTypes'],
  args: { collapsed: false, heading: 'Heading', divider: 'unset' } as Meta<SidebarArgs>['args'],
};

export default meta;

type Story = StoryObj<SidebarArgs>;

/** Every control bound: `collapsed` switches the rail, `heading` names the group, `divider` overrides the automatic rule. The toggle flips `collapsed` too. */
export const Playground: Story = {
  parameters: {
    controls: { include: ['collapsed', 'heading', 'divider'] },
    docs: {
      source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) },
    },
  },
  render: (args) => ({
    props: { ...args, dividerValue: dividerValue(args.divider) },
    template: frame(
      '<mud-sidebar-story-playground [collapsed]="collapsed" [heading]="heading" [divider]="dividerValue" />',
    ),
  }),
};

/** Upstream's example: two headed groups, the second divided from the first. */
export const Default: Story = {
  parameters: {
    controls: { disable: true },
    ...source({
      selector: 'app-side-nav',
      className: 'SideNavComponent',
      template: DEFAULT_TEMPLATE,
      imports: SIDEBAR_SYMBOLS,
    }),
  },
  render: () => ({ template: frame('<mud-sidebar-story-default />') }),
};

/** A full page: the sidebar takes 4 of 12 columns (1 when compact) and the content the rest. Use the toggle. */
export const MpowerPage: Story = {
  name: 'Mpower page',
  parameters: { layout: 'fullscreen', controls: { disable: true }, ...source(MPOWER_SOURCE) },
  render: () => ({ template: '<mud-sidebar-story-mpower />' }),
};

/** The compact rail: icons on 40px circles, labels in a tooltip. Every row needs an icon here. */
export const Compact: Story = {
  parameters: {
    controls: { disable: true },
    ...source({
      selector: 'app-side-nav',
      className: 'SideNavComponent',
      template: COMPACT_TEMPLATE,
      imports: [...SIDEBAR_SYMBOLS, ...TOGGLE_SYMBOLS],
      core: ['signal'],
      styles: TOGGLE_STYLES,
      body: 'readonly collapsed = signal(true);',
    }),
  },
  render: () => ({ template: frame('<mud-sidebar-story-compact />') }),
};

/** A `mud-tree` inside a group. The rail shows the top level; opening Documents expands the sidebar. */
export const WithTree: Story = {
  name: 'With tree',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebarEl = canvasElement.querySelector('mud-sidebar');

    await expect(sidebarEl).toHaveClass('mud-sidebar--compact');
    await userEvent.click(await canvas.findByRole('treeitem', { name: /Documents/ }));
    await expect(sidebarEl).not.toHaveClass('mud-sidebar--compact');
    await expect(await canvas.findByRole('treeitem', { name: /Passport/ })).toBeVisible();
  },
  parameters: { controls: { disable: true }, ...source(TREE_SOURCE) },
  render: () => ({ template: frame('<mud-sidebar-story-tree />') }),
};

/** Selected, disabled, a secondary label and the two badge colours. */
export const States: Story = {
  parameters: {
    controls: { disable: true },
    ...source({
      selector: 'app-side-nav-states',
      className: 'SideNavStatesComponent',
      template: STATES_TEMPLATE,
      imports: SIDEBAR_SYMBOLS,
    }),
  },
  render: () => ({ template: frame('<mud-sidebar-story-states />') }),
};
