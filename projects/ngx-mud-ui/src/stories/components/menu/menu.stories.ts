import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';
import { MudButton } from 'ngx-mud-ui/button';

const WRAP = 'display:flex;gap:32px;align-items:flex-start;padding:24px;min-height:420px';

// `ariaLabel` is aliased to `aria-label`; the Storybook arg key IS that string.
type MenuArgs = MudMenu & { 'aria-label'?: string };

const meta: Meta<MenuArgs> = {
  title: 'Components/Menu',
  component: MudMenu,
  subcomponents: { MudMenuItem, MudMenuTrigger },
  decorators: [moduleMetadata({ imports: [MudMenu, MudMenuItem, MudMenuTrigger, MudButton] })],
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
