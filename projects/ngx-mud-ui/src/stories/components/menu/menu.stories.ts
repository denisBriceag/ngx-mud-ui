import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import {
  MudMegaMenu,
  MudMegaMenuColumn,
  MudMegaMenuLink,
  MudMegaMenuOrigin,
  MudMegaMenuTrigger,
  MudMenu,
  MudMenuItem,
  MudMenuTrigger,
} from 'ngx-mud-ui/menu';
import { MudButton } from 'ngx-mud-ui/button';

const WRAP = 'display:flex;gap:32px;align-items:flex-start;padding:24px;min-height:420px';

// `ariaLabel` is aliased to `aria-label`; the Storybook arg key IS that string.
type MenuArgs = MudMenu & { 'aria-label'?: string };

const meta: Meta<MenuArgs> = {
  title: 'Components/Menu',
  component: MudMenu,
  subcomponents: {
    MudMenuItem,
    MudMenuTrigger,
  },
  decorators: [
    moduleMetadata({
      imports: [
        MudMenu,
        MudMenuItem,
        MudMenuTrigger,
        MudMegaMenu,
        MudMegaMenuColumn,
        MudMegaMenuLink,
        MudMegaMenuOrigin,
        MudMegaMenuTrigger,
        MudButton,
      ],
    }),
  ],
  args: {
    type: 'contextual',
    xPosition: 'after',
    yPosition: 'below',
    closeOnSelect: true,
  },
};

export default meta;

type Story = StoryObj<MenuArgs>;

export const Playground: Story = {
  args: {
    // `open` demos the standalone inline mode: the panel renders IN PLACE, in
    // the normal flow — it does NOT anchor to the button (anchoring is the
    // trigger's job). The column layout below puts the element right under the
    // button so inline rendering reads naturally. Opening via the button
    // suspends the inline panel (a presented menu ignores `open`); closing
    // the trigger brings it back.
    open: false,
    value: undefined,
  },

  render: ({ 'aria-label': ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel ?? 'Actions' },
    template: `
      <div style="${WRAP};flex-direction:column;align-items:flex-start;gap:8px">
        <button mudButton [mudMenuTriggerFor]="menu">Open menu</button>
        <mud-menu
          #menu
          [type]="type"
          [open]="open"
          [value]="value"
          [xPosition]="xPosition"
          [yPosition]="yPosition"
          [closeOnSelect]="closeOnSelect"
          [aria-label]="ariaLabelText"
        >
          <mud-menu-item value="edit">Edit</mud-menu-item>
          <mud-menu-item value="duplicate">Duplicate</mud-menu-item>
          <mud-menu-item value="archive" disabled>Archive</mud-menu-item>
          <mud-menu-item heading>Danger zone</mud-menu-item>
          <mud-menu-item value="delete">Delete</mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

/** The two semantics side by side, rendered inline via `open`. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-menu open aria-label="Actions">
          <mud-menu-item value="edit">Edit</mud-menu-item>
          <mud-menu-item value="duplicate">Duplicate</mud-menu-item>
          <mud-menu-item value="delete" disabled>Delete</mud-menu-item>
        </mud-menu>
        <mud-menu open type="selection" value="date" aria-label="Sort by">
          <mud-menu-item value="name">Name</mud-menu-item>
          <mud-menu-item value="date">Date modified</mud-menu-item>
          <mud-menu-item value="size">Size</mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

/** Leading icon, checkbox and radio items (pure-CSS inert visuals). */
export const Leadings: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-menu open aria-label="View options" [closeOnSelect]="false">
          <mud-menu-item value="preview" leading="icon">
            <svg icon viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="7"/></svg>
            Preview
          </mud-menu-item>
          <mud-menu-item heading>Layout</mud-menu-item>
          <mud-menu-item value="compact" leading="radio" selected>Compact</mud-menu-item>
          <mud-menu-item value="comfortable" leading="radio">Comfortable</mud-menu-item>
          <mud-menu-item heading>Show</mud-menu-item>
          <mud-menu-item value="hidden-files" leading="checkbox" selected>Hidden files</mud-menu-item>
          <mud-menu-item value="extensions" leading="checkbox">File extensions</mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

/** Segmented menus: separator only, and separator + section heading. */
export const Segmented: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-menu open aria-label="Segmented">
          <mud-menu-item value="one">Option 1</mud-menu-item>
          <mud-menu-item value="two">Option 2</mud-menu-item>
          <mud-menu-item heading></mud-menu-item>
          <mud-menu-item value="four">Option 4</mud-menu-item>
          <mud-menu-item value="five">Option 5</mud-menu-item>
        </mud-menu>
        <mud-menu open aria-label="Segmented with heading">
          <mud-menu-item value="one">Option 1</mud-menu-item>
          <mud-menu-item value="two">Option 2</mud-menu-item>
          <mud-menu-item heading>Section Heading</mud-menu-item>
          <mud-menu-item value="four">Option 4</mud-menu-item>
          <mud-menu-item value="five">Option 5</mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

/** Long labels clamp at two lines. */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-menu open aria-label="Truncation" style="max-inline-size:270px">
          <mud-menu-item value="short">Short label</mud-menu-item>
          <mud-menu-item value="long">
            A very long menu option label that wraps onto a second line and is then truncated with an ellipsis
          </mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

/** A submenu on the Share item, MatMenu-style. */
export const Nested: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <button mudButton [mudMenuTriggerFor]="root">Options</button>
        <mud-menu #root aria-label="Options">
          <mud-menu-item value="rename">Rename</mud-menu-item>
          <mud-menu-item [mudMenuTriggerFor]="share">Share</mud-menu-item>
        </mud-menu>
        <mud-menu #share aria-label="Share">
          <mud-menu-item value="email">Email</mud-menu-item>
          <mud-menu-item value="copy">Copy link</mud-menu-item>
        </mud-menu>
      </div>
    `,
  }),
};

// Fake header chrome for the full-width stories. The styles are scoped to the
// story's template, which is fine: the trigger and bar live in the story, and
// the panel is styled by the library partial, not by this block.
const HEADER_STYLES = `
  .demo-page { min-height: 560px; font-family: var(--font-family-primary, inherit); }
  .demo-pre { display:flex; justify-content:space-between; align-items:center; height:32px; padding:0 24px;
    background: var(--color-background-base-secondary); color: var(--color-text-base-default); font-size:12px; font-weight:500; }
  .demo-pre span + span { font-weight: 400; letter-spacing: 0.4em; }
  .demo-bar { display:flex; align-items:stretch; height:72px; padding:0 24px; gap:16px;
    background: var(--color-background-base-default); border-bottom: 1px solid var(--color-border-base-default); }
  .demo-logo { display:flex; align-items:center; gap:12px; font-weight:600; color: var(--color-text-base-default); }
  .demo-logo i { display:block; width:40px; height:40px; border-radius:8px; background: var(--color-background-brand-default); }
  .demo-logo small { display:block; font-size:11px; font-weight:400; color: var(--color-text-base-secondary); }
  .demo-nav { display:flex; align-items:stretch; gap:6px; }
  .demo-plain { display:inline-flex; align-items:center; padding:0 16px; border:0; background:transparent;
    color: var(--color-text-base-default); font-size: 16px; line-height: 24px; font-weight: 500; font-family: inherit; cursor:pointer; }
  .demo-plain:hover { background: var(--color-background-base-default-hover); }
  .demo-actions { display:flex; align-items:center; gap:12px; margin-left:auto; }
`;

const COLUMN = (heading: string, prefix: string) => `
  <mud-mega-menu-column heading="${heading}">
    ${[1, 2, 3, 4, 5, 6, 7].map((n) => `<a mudMegaMenuLink href="#${prefix}-${n}">Option</a>`).join('\n    ')}
  </mud-mega-menu-column>`;

/** A header bar marked with `mudMegaMenuOrigin`; the panel spans exactly that bar. Two expandable items share it. */
export const FullWidth: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => ({
    styles: [HEADER_STYLES],
    template: `
      <div class="demo-page">
        <div class="demo-pre"><span>Guvernul Republicii Moldova</span><span>Ro Ru En</span></div>
        <header class="demo-bar" mudMegaMenuOrigin>
          <div class="demo-logo"><i></i><div>mpay<small>serviciul guvernamental de plăți electronice</small></div></div>
          <nav class="demo-nav" aria-label="Principal">
            <button [mudMegaMenuTriggerFor]="services">Servicii</button>
            <button [mudMegaMenuTriggerFor]="about">Despre</button>
            <button class="demo-plain" type="button">Option</button>
          </nav>
          <div class="demo-actions">
            <button mudButton shape="circular" size="medium">Autentifică-te</button>
            <button mudButton color="secondary" shape="circular" size="medium">Obține semnătura</button>
          </div>
        </header>

        <mud-mega-menu #services>
          ${COLUMN('Heading', 'a')}
          ${COLUMN('Heading', 'b')}
          ${COLUMN('Heading', 'c')}
        </mud-mega-menu>
        <mud-mega-menu #about>
          ${COLUMN('Despre noi', 'd')}
          ${COLUMN('Contacte', 'e')}
        </mud-mega-menu>
      </div>
    `,
  }),
};

/** No `mudMegaMenuOrigin` anywhere: the panel falls back to the full viewport width under the button. */
export const FullWidthNoOrigin: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => ({
    styles: [HEADER_STYLES],
    template: `
      <div class="demo-page">
        <header class="demo-bar">
          <nav class="demo-nav" aria-label="Principal">
            <button [mudMegaMenuTriggerFor]="services">Servicii</button>
          </nav>
        </header>
        <mud-mega-menu #services>
          ${COLUMN('Heading', 'a')}
          ${COLUMN('Heading', 'b')}
        </mud-mega-menu>
      </div>
    `,
  }),
};
