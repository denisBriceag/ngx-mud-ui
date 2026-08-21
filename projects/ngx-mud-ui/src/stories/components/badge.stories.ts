import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudBadge } from '../../../badge/src/public-api';
import { MudButton } from '../../../button/src/public-api';

const ROW = 'display:flex;gap:32px;align-items:center;flex-wrap:wrap;padding:24px';
const TILE =
  'display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;' +
  'border-radius:8px;background:var(--color-background-base-secondary)';

const meta: Meta<MudBadge> = {
  title: 'Components/Badge',
  component: MudBadge,
  decorators: [moduleMetadata({ imports: [MudBadge, MudButton] })],
  argTypes: {
    mudBadge: { control: 'text', description: 'Badge content; null/empty removes the badge' },
    badgeSize: {
      control: 'inline-radio',
      options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
      description:
        'extra-small is dot-only: a count at that size degrades to a dot (dev-mode warning)',
    },
    badgeColor: {
      control: 'inline-radio',
      options: ['default', 'brand', 'positive', 'warning', 'danger', 'dark', 'light', 'neutral', 'accent'],
    },
    badgePosition: {
      control: 'select',
      options: [
        'above after',
        'above before',
        'below before',
        'below after',
        'before',
        'after',
        'above',
        'below',
      ],
      description: 'Corner overlay position; single keywords default the missing axis',
    },
    badgeMax: { control: 'number', description: 'Numeric content above this renders as "<max>+"' },
    badgeVariant: { control: 'inline-radio', options: ['count', 'dot'] },
    badgeDescription: {
      control: 'text',
      description:
        'Screen-reader description wired via aria-describedby; hides the visual count from assistive tech',
    },
  },
  args: {
    mudBadge: '5',
    badgeSize: 'medium',
    badgeColor: 'danger',
    badgePosition: 'above after',
    badgeMax: null,
    badgeVariant: 'count',
    badgeDescription: '5 unread notifications',
  },
};

export default meta;

type Story = StoryObj<MudBadge>;

export const Playground: Story = {
  args: {
    badgeSize: 'small',
  },

  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <button
          mudButton="outlined"
          color="strict"
          [mudBadge]="mudBadge"
          [badgeSize]="badgeSize"
          [badgeColor]="badgeColor"
          [badgePosition]="badgePosition"
          [badgeMax]="badgeMax"
          [badgeVariant]="badgeVariant"
          [badgeDescription]="badgeDescription"
        >
          Inbox
        </button>
      </div>
    `,
  }),
};

/** Counts support small–large; extra-small is dot-only per the design system. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeSize="extra-large"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="large"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="medium"></span>
        <span style="${TILE}" mudBadge="1" badgeSize="small"></span>
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="extra-small"></span>
      </div>
    `,
  }),
};

/**
 * The first row is the official design-system palette. The second row shows
 * the extra names (`dark` renders like `default`; `light`/`neutral`/`accent`
 * have no official equivalent).
 */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeColor="default"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="brand"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="positive"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="warning"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="danger"></span>
      </div>
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeColor="dark"></span>
        <span style="${TILE};background:var(--color-background-base-inverse-default)" mudBadge="1" badgeColor="light"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="neutral"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="accent"></span>
      </div>
    `,
  }),
};

/** Single keywords default the missing axis: `above` → above after, `before` → above before. */
export const Positions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="1" badgeColor="danger" badgePosition="above before"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="danger" badgePosition="above after"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="danger" badgePosition="below before"></span>
        <span style="${TILE}" mudBadge="1" badgeColor="danger" badgePosition="below after"></span>
      </div>
    `,
  }),
};

/** Numeric content above `badgeMax` renders as `<max>+`; non-numeric content is untouched. */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge="4" [badgeMax]="99" badgeColor="danger"></span>
        <span style="${TILE}" mudBadge="99" [badgeMax]="99" badgeColor="danger"></span>
        <span style="${TILE}" mudBadge="1204" [badgeMax]="99" badgeColor="danger"></span>
      </div>
    `,
  }),
};

/**
 * The dot variant ignores content — pair it with `badgeDescription` so the
 * state is announced. From medium up the dot carries a centered core in the
 * content color (2×2 at medium, 3×3 at large/extra-large).
 */
export const Dot: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="extra-small" badgeColor="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="small" badgeColor="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="medium" badgeColor="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="large" badgeColor="danger" badgeDescription="New activity"></span>
        <span style="${TILE}" mudBadge badgeVariant="dot" badgeSize="extra-large" badgeColor="danger" badgeDescription="New activity"></span>
      </div>
    `,
  }),
};

/**
 * Inline (non-overlay) badges nested in other components use the `.badge`
 * CSS classes from the `/styles` bundle directly — no directive needed.
 * Mark purely decorative counts with `aria-hidden` when the text already
 * conveys them.
 */
export const InlineNested: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button mudButton color="secondary">
          Filters <span class="badge badge--solid-neutral badge--lg">3</span>
        </button>
        <button mudButton="outlined" color="strict">
          Drafts <span class="badge badge--solid-accent badge--lg">12</span>
        </button>
      </div>
    `,
  }),
};

/**
 * `badgeDescription` hides the visual count from assistive tech (`aria-hidden`)
 * and describes the host instead via `aria-describedby`, so a screen reader
 * announces "Inbox, 5 unread notifications" rather than "Inbox 5".
 */
export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button
          mudButton="outlined"
          color="strict"
          mudBadge="5"
          badgeColor="danger"
          badgeDescription="5 unread notifications"
        >
          Inbox
        </button>
      </div>
    `,
  }),
};
