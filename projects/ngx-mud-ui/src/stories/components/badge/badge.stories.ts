import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudBadge, MudCornerBadge } from 'ngx-mud-ui/badge';
import { MudButton } from 'ngx-mud-ui/button';

const ROW = 'display:flex;gap:32px;align-items:center;flex-wrap:wrap;padding:24px';
const TILE =
  'display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;' +
  'border-radius:8px;background:var(--mud-color-background-base-secondary)';

type BadgeArgs = MudBadge & { 'aria-label'?: string };

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  component: MudBadge,
  decorators: [moduleMetadata({ imports: [MudBadge, MudCornerBadge, MudButton] })],
  argTypes: {
    count: { control: 'number', description: 'Shown when `type` is numbered; empty renders no text' },
    max: { control: 'number', description: 'Counts above this render as "{max}+"' },
    type: { control: 'inline-radio', options: ['numbered', 'dot'] },
    variant: {
      control: 'inline-radio',
      options: ['default', 'brand', 'positive', 'warning', 'danger', 'dark', 'light', 'neutral', 'accent'],
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'xs is dot-only: a numbered badge at that size renders as a dot',
    },
    disabled: { control: 'boolean' },
    live: { control: 'boolean', description: 'Announce count changes (role="status")' },
    notificationLabel: { control: 'text', description: 'Accessible name when there is no count to read' },
    'aria-label': { control: 'text', description: 'Overrides the accessible name' },
  },
  args: {
    count: 5,
    max: 99,
    type: 'numbered',
    variant: 'danger',
    size: 'md',
    disabled: false,
    live: false,
    notificationLabel: 'Notification',
    'aria-label': '',
  },
};

export default meta;

type Story = StoryObj<BadgeArgs>;

export const Playground: Story = {
  // The alias isn't a valid template identifier — pass it under a plain prop name.
  render: (args) => ({
    props: { ...args, label: args['aria-label'] || undefined },
    template: `
      <div style="${ROW}">
        <mud-badge
          [count]="count"
          [max]="max"
          [type]="type"
          [variant]="variant"
          [size]="size"
          [disabled]="disabled"
          [live]="live"
          [notificationLabel]="notificationLabel"
          [aria-label]="label"
        />
      </div>
    `,
  }),
};

/** Five steps: xl 24 / lg 20 / md 16 / sm 12 / xs 8 (dot only). */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-badge [count]="1" size="xl" />
        <mud-badge [count]="1" size="lg" />
        <mud-badge [count]="1" size="md" />
        <mud-badge [count]="1" size="sm" />
        <mud-badge size="xs" />
      </div>
    `,
  }),
};

/**
 * The first row is the official design-system palette. The second row shows
 * the extra names (`dark` renders like `default`; `light`/`neutral`/`accent`
 * have no official equivalent).
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-badge [count]="1" variant="default" />
        <mud-badge [count]="1" variant="brand" />
        <mud-badge [count]="1" variant="positive" />
        <mud-badge [count]="1" variant="warning" />
        <mud-badge [count]="1" variant="danger" />
      </div>
      <div style="${ROW}">
        <mud-badge [count]="1" variant="dark" />
        <span style="${TILE};background:var(--mud-color-background-base-inverse-default)">
          <mud-badge [count]="1" variant="light" />
        </span>
        <mud-badge [count]="1" variant="neutral" />
        <mud-badge [count]="1" variant="accent" />
      </div>
    `,
  }),
};

/** A dot carries no text and is named by `notificationLabel`. From md up it has a centered core. */
export const Dot: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-badge type="dot" size="xs" />
        <mud-badge type="dot" size="sm" />
        <mud-badge type="dot" size="md" />
        <mud-badge type="dot" size="lg" />
        <mud-badge type="dot" size="xl" />
      </div>
    `,
  }),
};

/** Counts above `max` render as `{max}+`. */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-badge [count]="4" />
        <mud-badge [count]="99" />
        <mud-badge [count]="1204" />
        <mud-badge [count]="12" [max]="9" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-badge [count]="3" disabled />
        <mud-badge type="dot" size="lg" disabled />
      </div>
    `,
  }),
};

/**
 * `<mud-badge>` drops into other components' content: buttons, tab labels,
 * tree items and sidebar items.
 */
export const InlineNested: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button mudButton color="secondary">
          Filters <mud-badge [count]="3" variant="neutral" size="lg" />
        </button>
        <button mudButton="outlined" color="strict">
          Drafts <mud-badge [count]="12" variant="accent" size="lg" />
        </button>
      </div>
    `,
  }),
};

/** `[mudBadge]` pins the same badge to a corner of its host. Counts need sm and up; xs is a dot. */
export const CornerSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeSize="xl"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="lg"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="md"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="sm"></span>
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="xs"></span>
      </div>
    `,
  }),
};

/** The same nine variants as `<mud-badge>`. */
export const CornerVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeVariant="default"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="brand"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="positive"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="warning"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="danger"></span>
      </div>
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeVariant="dark"></span>
        <span style="${TILE};background:var(--mud-color-background-base-inverse-default)" mudBadge="1" badgeVariant="light"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="neutral"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="accent"></span>
      </div>
    `,
  }),
};

/** Single keywords default the missing axis: `above` → above after, `before` → above before. */
export const CornerPositions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeVariant="danger" badgePosition="above before"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="danger" badgePosition="above after"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="danger" badgePosition="below before"></span>
        <span style="${TILE}" mudBadge="1" badgeVariant="danger" badgePosition="below after"></span>
      </div>
    `,
  }),
};

/** Numeric content above `badgeMax` renders as `<max>+`; non-numeric content is untouched. */
export const CornerTruncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="4" [badgeMax]="99" badgeVariant="danger"></span>
        <span style="${TILE}" mudBadge="99" [badgeMax]="99" badgeVariant="danger"></span>
        <span style="${TILE}" mudBadge="1204" [badgeMax]="99" badgeVariant="danger"></span>
      </div>
    `,
  }),
};

/**
 * `badgeType="dot"` ignores content — pair it with `badgeDescription` so the
 * state is announced. From md up the dot carries a centered core in the
 * content color (2×2 at md, 3×3 at lg/xl).
 */
export const CornerDot: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="xs" badgeVariant="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="sm" badgeVariant="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="md" badgeVariant="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="lg" badgeVariant="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeType="dot" badgeSize="xl" badgeVariant="danger" badgeDescription="New activity"></span>
      </div>
    `,
  }),
};

/**
 * `badgeDescription` hides the visual count from assistive tech (`aria-hidden`)
 * and describes the host instead via `aria-describedby`, so a screen reader
 * announces "Inbox, 5 unread notifications" rather than "Inbox 5".
 */
export const CornerAccessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button
          mudButton="outlined"
          color="strict"
          mudBadge="5"
          badgeVariant="danger"
          badgeDescription="5 unread notifications"
        >
          Inbox
        </button>
      </div>
    `,
  }),
};
