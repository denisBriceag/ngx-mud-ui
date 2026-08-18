import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { EgovAvatar } from '../../../avatar/src/public-api';
import { EgovIconComponent, provideEgovIcons } from '../../../icons/src/public-api';
import { person } from '../../../icons/src/lib/data';

const ROW = 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:24px';
const SIZES = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;

// Deterministic offline placeholder portrait (no network in test runs).
const portrait = (bg: string, fg: string): string =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" fill="${bg}"/>` +
      `<circle cx="50" cy="38" r="18" fill="${fg}"/>` +
      `<circle cx="50" cy="98" r="34" fill="${fg}"/>` +
      `</svg>`,
  );

const PORTRAITS = [
  portrait('#BFDBFE', '#1D4ED8'),
  portrait('#FDE68A', '#B45309'),
  portrait('#BBF7D0', '#15803D'),
];

/** Icon avatars force the svg to 16px (xs), 20px (sm/md) or 24px (lg/xl). */
const ICON_SCALE: Record<(typeof SIZES)[number], number> = {
  'extra-small': 16,
  small: 20,
  medium: 20,
  large: 24,
  'extra-large': 24,
};

const meta: Meta<EgovAvatar> = {
  title: 'Components/Avatar',
  component: EgovAvatar,
  decorators: [
    applicationConfig({ providers: [provideEgovIcons([person])] }),
    moduleMetadata({ imports: [EgovAvatar, EgovIconComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: [...SIZES] },
    label: {
      control: 'text',
      description:
        'Accessible name: sets role="img" + aria-label on the host and makes the content presentational for assistive tech',
    },
  },
  args: {
    size: 'medium',
    label: undefined,
  },
};

export default meta;

type Story = StoryObj<EgovAvatar>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <egov-avatar [size]="size" [label]="label">OP</egov-avatar>
      </div>
    `,
  }),
};

/**
 * The content kind is detected from the projected content — an `img` crops to
 * the circle, an `egov-icon`/`svg` gets the icon tint, anything else renders
 * as uppercase initials. Image avatars need an `alt` text.
 */
export const ContentTypes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { src: PORTRAITS[0] },
    template: `
      <div style="${ROW}">
        <egov-avatar><img [src]="src" alt="Olga Popescu" /></egov-avatar>
        <egov-avatar label="Olga Popescu">OP</egov-avatar>
        <egov-avatar><egov-icon name="person" [scale]="20" /></egov-avatar>
      </div>
    `,
  }),
};

/**
 * extra-small 24px (12/16 text, 16px icon), small 32px (14/20, 20px icon),
 * medium 40px (14/20, 20px icon), large 48px (16/24, 24px icon),
 * extra-large 72px (18/28, 24px icon). Pass a matching `scale` to the icon
 * so its geometry stays crisp.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      sizes: SIZES.map((size) => ({ size, icon: ICON_SCALE[size] })),
      src: PORTRAITS[0],
    },
    template: `
      @for (s of sizes; track s.size) {
        <div style="${ROW};padding:8px 24px">
          <egov-avatar [size]="s.size"><img [src]="src" alt="Olga Popescu" /></egov-avatar>
          <egov-avatar [size]="s.size">OP</egov-avatar>
          <egov-avatar [size]="s.size"><egov-icon name="person" [scale]="s.icon" /></egov-avatar>
          <span style="width:12ch;color:var(--color-text-base-secondary)">{{ s.size }}</span>
        </div>
      }
    `,
  }),
};

/**
 * The stack is CSS-only — wrap avatars in `.avatar-stack`; no Angular API.
 * Overflow is a plain initials avatar (e.g. `+5`) — give it a `label` so
 * assistive tech hears "5 more people" instead of "+5".
 */
export const AvatarStack: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { portraits: PORTRAITS },
    template: `
      <div style="${ROW}">
        <div class="avatar-stack">
          @for (src of portraits; track src) {
            <egov-avatar><img [src]="src" alt="" /></egov-avatar>
          }
          <egov-avatar label="5 more people">+5</egov-avatar>
        </div>
      </div>
    `,
  }),
};
