import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { EgovButton, EgovIconButton } from '../../../button/src/public-api';
import { EgovIconComponent, provideEgovIcons } from '../../../icons/src/public-api';
import { chevronBottom, plusLarge, plusSmall } from '../../../icons/src/public-api';

const ROW = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<EgovButton> = {
  title: 'Components/Button',
  component: EgovButton,
  decorators: [
    applicationConfig({ providers: [provideEgovIcons([plusSmall, plusLarge, chevronBottom])] }),
    moduleMetadata({ imports: [EgovButton, EgovIconButton, EgovIconComponent] }),
  ],
  argTypes: {
    egovButton: { control: 'inline-radio', options: ['filled', 'outlined', 'text'], description: 'Button variant' },
    color: { control: 'select', options: ['primary', 'secondary', 'strict', 'neutral', 'destructive'] },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    egovButton: 'filled',
    color: 'primary',
    size: 'large',
    shape: 'rectangular',
    disabled: false,
    loading: false,
  },
};

export default meta;

type Story = StoryObj<EgovButton>;

/**
 * `secondary` and `neutral` are only available for the `filled` variant;
 * other variants fall back to `primary` with a dev-mode warning.
 */
export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <button
          type="button"
          [egovButton]="egovButton"
          [color]="color"
          [size]="size"
          [shape]="shape"
          [disabled]="disabled"
          [loading]="loading"
        >
          Button
        </button>
      </div>
    `,
  }),
};

export const FilledStyles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton>Primary</button>
        <button type="button" egovButton color="secondary">Secondary</button>
        <button type="button" egovButton color="strict">Strict</button>
        <button type="button" egovButton color="neutral">Neutral</button>
        <button type="button" egovButton color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const OutlinedStyles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton="outlined">Primary</button>
        <button type="button" egovButton="outlined" color="strict">Strict</button>
        <button type="button" egovButton="outlined" color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const TextStyles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton="text">Primary</button>
        <button type="button" egovButton="text" color="strict">Strict</button>
        <button type="button" egovButton="text" color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton size="large">Large</button>
        <button type="button" egovButton size="medium">Medium</button>
        <button type="button" egovButton size="small">Small</button>
      </div>
    `,
  }),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton>Rectangular</button>
        <button type="button" egovButton shape="circular">Circular</button>
      </div>
    `,
  }),
};

/**
 * Leading/trailing icons are plain projected content — no extra API needed.
 * These use the library's own `<egov-icon>` from `ngx-egov-ui/icons`
 * (decorative by default: no aria-label means aria-hidden).
 */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton><egov-icon name="plus-small" [scale]="20" /> Leading icon</button>
        <button type="button" egovButton>Trailing icon <egov-icon name="chevron-bottom" [scale]="20" /></button>
        <button type="button" egovButton aria-label="Add"><egov-icon name="plus-large" [scale]="20" /></button>
      </div>
    `,
  }),
};

/** Icon-only transparent circular button. An `aria-label` is required. */
export const IconButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovIconButton aria-label="Add"><egov-icon name="plus-large" [scale]="20" /></button>
        <button type="button" egovIconButton aria-label="Add" disabled><egov-icon name="plus-large" [scale]="20" /></button>
      </div>
    `,
  }),
};

/**
 * Loading buttons stay focusable so keyboard users don't lose their place,
 * but expose `aria-busy` / `aria-disabled` and ignore activation.
 */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton loading>Primary</button>
        <button type="button" egovButton color="secondary" loading>Secondary</button>
        <button type="button" egovButton color="strict" loading>Strict</button>
        <button type="button" egovButton color="neutral" loading>Neutral</button>
        <button type="button" egovButton color="destructive" loading>Destructive</button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" egovButton disabled>Primary</button>
        <button type="button" egovButton color="secondary" disabled>Secondary</button>
        <button type="button" egovButton color="strict" disabled>Strict</button>
        <button type="button" egovButton color="neutral" disabled>Neutral</button>
        <button type="button" egovButton color="destructive" disabled>Destructive</button>
      </div>
    `,
  }),
};

const BADGE_PLATFORMS = [
  { code: 'mpay', logo: 'm-pay', label: 'Plătește cu mpay' },
  { code: 'mpass', logo: 'm-pass', label: 'Autentifică-te prin mpass' },
  { code: 'msign', logo: 'm-sign', label: 'Semnează prin msign' },
  { code: 'mpower', logo: 'm-power', label: 'Împuternicește cu mpower' },
  { code: 'mdelivery', logo: 'm-delivery', label: 'Livrează prin mdelivery' },
] as const;

const badgeButton = (platform: (typeof BADGE_PLATFORMS)[number], style: 'primary' | 'neutral', extra = ''): string => `
  <button class="mud-btn btn-badge btn-badge--${style} btn-badge--${platform.code}" type="button" ${extra}>
    <span class="btn-badge__logo" aria-hidden="true"><img src="/logos/m-platforms/${platform.logo}.svg" alt="" /></span>
    <span class="btn-badge__label">${platform.label}</span>
  </button>`;

/**
 * Badge Buttons are entry points to the trusted government platforms
 * (mpay, mpass, msign, mpower, mdelivery). They are plain design-system
 * markup for now — not yet covered by a directive — shown here for reference,
 * in `primary` and `neutral` styles plus the loading and disabled states.
 */
export const BadgeButtons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;padding:24px">
        ${BADGE_PLATFORMS.map((platform) => badgeButton(platform, 'primary')).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;padding:24px">
        ${BADGE_PLATFORMS.map((platform) => badgeButton(platform, 'neutral')).join('')}
      </div>
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:24px">
        <button class="mud-btn btn-badge btn-badge--primary btn-badge--mdelivery mud-btn-loading" type="button" aria-busy="true" aria-label="Loading"></button>
        ${badgeButton(BADGE_PLATFORMS[0], 'primary', 'disabled')}
        ${badgeButton(BADGE_PLATFORMS[0], 'neutral', 'disabled')}
      </div>
    `,
  }),
};

/** Links styled as buttons share the same API; `disabled` maps to `aria-disabled`. */
export const AnchorButtons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a egovButton href="https://egov.md" target="_blank" rel="noopener">Anchor filled</a>
        <a egovButton="outlined" href="https://egov.md" target="_blank" rel="noopener">Anchor outlined</a>
        <a egovButton href="https://egov.md" disabled>Anchor disabled</a>
      </div>
    `,
  }),
};
