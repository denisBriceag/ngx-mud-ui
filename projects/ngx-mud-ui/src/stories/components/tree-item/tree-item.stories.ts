import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { provideRouter, RouterLink, withHashLocation } from '@angular/router';
import { MudBadge } from 'ngx-mud-ui/badge';
import { group, MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';

// Every story renders a real @Component and shows that same component under
// "Show code". The template constants below are shared by the rendered class
// and its snippet, so the two cannot drift apart. Links use real routerLink,
// backed by a hash-location router (see meta) so clicks stay inside the frame.

interface PlaygroundArgs {
  selected: boolean;
  level: number;
}

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
  tag?: boolean;
}

const componentSource = (o: SnippetOptions): string => {
  const badge = o.template.includes('<mud-badge');
  const imports = ['MudTreeItem', 'MudIconComponent', 'RouterLink', ...(badge ? ['MudBadge'] : []), ...(o.tag ? ['MudTag'] : [])];

  return [
    "import { ChangeDetectionStrategy, Component } from '@angular/core';",
    "import { RouterLink } from '@angular/router';",
    ...(badge ? ["import { MudBadge } from 'ngx-mud-ui/badge';"] : []),
    "import { MudIconComponent } from 'ngx-mud-ui/icons';",
    ...(o.tag ? ["import { MudTag } from 'ngx-mud-ui/tag';"] : []),
    "import { MudTreeItem } from 'ngx-mud-ui/tree-item';",
    '',
    '@Component({',
    `  selector: '${o.selector}',`,
    `  imports: [${imports.join(', ')}],`,
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    `  template: ${BT}`,
    indent(o.template, 4),
    `  ${BT},`,
    '})',
    `export class ${o.className} {}`,
  ].join('\n');
};

// Outline icon always; the filled one replaces it while the row is selected.
const ICONS = `<mud-icon icon name="group" [scale]="20" />
  <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />`;

const BASE_IMPORTS = [MudTreeItem, MudIconComponent, RouterLink, MudBadge];

/* ------------------------------------------------------------------ */
/* Playground                                                          */
/* ------------------------------------------------------------------ */

const playgroundSource = (args: PlaygroundArgs): string =>
  componentSource({
    selector: 'app-nav-link',
    className: 'NavLinkComponent',
    template: `
<!-- In an app, drive selected from the router instead:
     routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive" -->
<a mud-tree-item routerLink="/utilizatori" [selected]="${args.selected}" [level]="${args.level}">
  ${ICONS}
  Utilizatori
</a>`,
  });

/** Story-only host for the Playground: the controls alone own `selected` and `level`. */
@Component({
  selector: 'mud-tree-item-story-playground',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a mud-tree-item routerLink="/elemente/utilizatori" [selected]="selected()" [level]="level()">
      <mud-icon icon name="group" [scale]="20" />
      <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
      Utilizatori
    </a>
  `,
})
class TreeItemStoryPlayground {
  readonly selected = input(false);
  readonly level = input(1);
}

/* ------------------------------------------------------------------ */
/* Static recipes: one template, rendered and shown.                   */
/* ------------------------------------------------------------------ */

const STATES_TEMPLATE = `
<!-- Hover and Tab to the first row to see those states. -->
<a mud-tree-item routerLink="/stari/implicit">
  ${ICONS}
  Default
</a>
<!-- selected marks the current page; bind it to routerLinkActive in an app (see Playground). -->
<a mud-tree-item routerLink="/stari/selectat" selected>
  ${ICONS}
  Selected
</a>
<!-- Only a button can be disabled; a link cannot. -->
<button mud-tree-item type="button" disabled>
  ${ICONS}
  Disabled
</button>`;

/** Story-only host for the States story. */
@Component({
  selector: 'mud-tree-item-story-states',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: STATES_TEMPLATE,
})
class TreeItemStoryStates {}

const ICONS_TEMPLATE = `
<a mud-tree-item routerLink="/pictograme/cu">
  ${ICONS}
  With icon
</a>
<a mud-tree-item routerLink="/pictograme/fara">Without icon</a>
<!-- No selectedIcon: the outline icon stays and only turns brand blue. -->
<a mud-tree-item routerLink="/pictograme/selectat" selected>
  <mud-icon icon name="group" [scale]="20" />
  Selected, no filled variant
</a>`;

/** Story-only host for the Icons story. */
@Component({
  selector: 'mud-tree-item-story-icons',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ICONS_TEMPLATE,
})
class TreeItemStoryIcons {}

const SECONDARY_TEMPLATE = `
<a mud-tree-item routerLink="/cereri">
  ${ICONS}
  Cereri
  <span secondaryLabel>12 noi</span>
</a>
<a mud-tree-item routerLink="/cereri/selectat" selected>
  ${ICONS}
  Cereri
  <span secondaryLabel>12 noi</span>
</a>
<!-- With trailing content the secondary label sits 10px before it. -->
<a mud-tree-item routerLink="/cereri/noi">
  ${ICONS}
  Cereri
  <span secondaryLabel>azi</span>
  <mud-badge trailing [count]="3" variant="danger" size="xl" />
</a>`;

/** Story-only host for the SecondaryLabel story. */
@Component({
  selector: 'mud-tree-item-story-secondary',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: SECONDARY_TEMPLATE,
})
class TreeItemStorySecondary {}

const BADGE_TEMPLATE = `
<!-- size="xl" is the 24px badge; inside a tree item it is pinned to exactly 24×24. -->
<a mud-tree-item routerLink="/mesaje">
  ${ICONS}
  Mesaje
  <mud-badge trailing [count]="3" variant="danger" size="xl" />
</a>
<a mud-tree-item routerLink="/notificari">
  ${ICONS}
  Notificări
  <mud-badge trailing [count]="9" variant="neutral" size="xl" />
</a>`;

/** Story-only host for the TrailingBadge story. */
@Component({
  selector: 'mud-tree-item-story-badge',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: BADGE_TEMPLATE,
})
class TreeItemStoryBadge {}

const TAG_TEMPLATE = `
<!-- Tags are pinned to 24px tall inside a tree item, whatever their size. -->
<a mud-tree-item routerLink="/plati">
  ${ICONS}
  Plăți
  <mud-tag trailing color="success">Nou</mud-tag>
</a>
<a mud-tree-item routerLink="/arhiva">
  ${ICONS}
  Arhivă
  <mud-tag trailing size="small">Beta</mud-tag>
</a>`;

/** Story-only host for the TrailingTag story. */
@Component({
  selector: 'mud-tree-item-story-tag',
  imports: [...BASE_IMPORTS, MudTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TAG_TEMPLATE,
})
class TreeItemStoryTag {}

const LEVELS_TEMPLATE = `
<!-- Outside a tree, set level yourself: 24px + 32px per level past the first. -->
<a mud-tree-item routerLink="/niveluri/1">
  ${ICONS}
  Level 1
</a>
<a mud-tree-item routerLink="/niveluri/2" [level]="2">
  ${ICONS}
  Level 2
</a>
<a mud-tree-item routerLink="/niveluri/3" [level]="3">
  ${ICONS}
  Level 3
</a>`;

/** Story-only host for the Levels story. */
@Component({
  selector: 'mud-tree-item-story-levels',
  imports: BASE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: LEVELS_TEMPLATE,
})
class TreeItemStoryLevels {}

const source = (selector: string, className: string, template: string, tag = false) => ({
  docs: { source: { language: 'ts', code: componentSource({ selector, className, template, tag }) } },
});

// A fixed-width column, like the sidebar the rows will live in.
const frame = (rows: string) => `<div style="width: 320px; border: 1px solid var(--mud-color-border-base-default)">${rows}</div>`;

const meta: Meta<MudTreeItem> = {
  title: 'Components/Tree Item',
  component: MudTreeItem,
  decorators: [
    applicationConfig({
      providers: [
        provideMudIcons([group]),
        // Story-only router: every path resolves and the hash keeps navigation inside the frame.
        provideRouter([{ path: '**', children: [] }], withHashLocation()),
      ],
    }),
    moduleMetadata({
      imports: [
        TreeItemStoryPlayground,
        TreeItemStoryStates,
        TreeItemStoryIcons,
        TreeItemStorySecondary,
        TreeItemStoryBadge,
        TreeItemStoryTag,
        TreeItemStoryLevels,
      ],
    }),
  ],
  argTypes: {
    selected: { control: 'boolean' },
    level: { control: { type: 'number', min: 1, max: 4 } },
  } as Meta<MudTreeItem>['argTypes'],
  args: { selected: false, level: 1 } as Meta<MudTreeItem>['args'],
};

export default meta;

type Story = StoryObj<MudTreeItem>;

/** Every input bound: toggle `selected` and change `level` from the controls. */
export const Playground: Story = {
  parameters: {
    docs: { source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) } },
  },
  render: (args) => ({
    props: args,
    template: frame('<mud-tree-item-story-playground [selected]="selected" [level]="level" />'),
  }),
};

/** Default, selected and disabled; hover and Tab to see the other two states. */
export const States: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-states', 'NavStatesComponent', STATES_TEMPLATE) },
  render: () => ({ template: frame('<mud-tree-item-story-states />') }),
};

/** With an icon, and without. The 24px start padding is the same either way. */
export const Icons: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-icons', 'NavIconsComponent', ICONS_TEMPLATE) },
  render: () => ({ template: frame('<mud-tree-item-story-icons />') }),
};

export const SecondaryLabel: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-requests', 'NavRequestsComponent', SECONDARY_TEMPLATE) },
  render: () => ({ template: frame('<mud-tree-item-story-secondary />') }),
};

/** Badges are pinned to exactly 24×24, so a long count clips rather than stretching the badge. */
export const TrailingBadge: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-inbox', 'NavInboxComponent', BADGE_TEMPLATE) },
  render: () => ({ template: frame('<mud-tree-item-story-badge />') }),
};

/** Tags are pinned to 24px tall, both sizes. */
export const TrailingTag: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-payments', 'NavPaymentsComponent', TAG_TEMPLATE, true) },
  render: () => ({ template: frame('<mud-tree-item-story-tag />') }),
};

/** Indent = 24px + 32px per level past the first. */
export const Levels: Story = {
  parameters: { controls: { disable: true }, ...source('app-nav-levels', 'NavLevelsComponent', LEVELS_TEMPLATE) },
  render: () => ({ template: frame('<mud-tree-item-story-levels />') }),
};
