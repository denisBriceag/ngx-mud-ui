import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
import { chevronBottom, plusLarge, plusSmall } from 'ngx-mud-ui/icons';

const ROW = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<MudButton> = {
  title: 'Components/Button',
  component: MudButton,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([plusSmall, plusLarge, chevronBottom])] }),
    moduleMetadata({ imports: [MudButton, MudIconButton, MudIconComponent] }),
  ],
  argTypes: {
    mudButton: { control: 'inline-radio', options: ['filled', 'outlined', 'text'], description: 'Button variant' },
    color: { control: 'select', options: ['primary', 'secondary', 'strict', 'neutral', 'destructive'] },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    mudButton: 'filled',
    color: 'primary',
    size: 'large',
    shape: 'rectangular',
    disabled: false,
    loading: false,
  },
};

export default meta;

type Story = StoryObj<MudButton>;

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
          [mudButton]="mudButton"
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
        <button type="button" mudButton>Primary</button>
        <button type="button" mudButton color="secondary">Secondary</button>
        <button type="button" mudButton color="strict">Strict</button>
        <button type="button" mudButton color="neutral">Neutral</button>
        <button type="button" mudButton color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const OutlinedStyles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton="outlined">Primary</button>
        <button type="button" mudButton="outlined" color="strict">Strict</button>
        <button type="button" mudButton="outlined" color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const TextStyles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton="text">Primary</button>
        <button type="button" mudButton="text" color="strict">Strict</button>
        <button type="button" mudButton="text" color="destructive">Destructive</button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton size="large">Large</button>
        <button type="button" mudButton size="medium">Medium</button>
        <button type="button" mudButton size="small">Small</button>
      </div>
    `,
  }),
};

/** `fullWidth` stretches the button to its container (forms, button groups). */
export const FullWidth: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:320px">
        <button type="button" mudButton fullWidth>Continue</button>
        <button type="button" mudButton="outlined" fullWidth>Back</button>
      </div>
    `,
  }),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton>Rectangular</button>
        <button type="button" mudButton shape="circular">Circular</button>
      </div>
    `,
  }),
};

/**
 * Leading/trailing icons are plain projected content — no extra API needed.
 * These use the library's own `<mud-icon>` from `ngx-mud-ui/icons`
 * (decorative by default: no aria-label means aria-hidden).
 */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton><mud-icon name="plus-small" [scale]="20" /> Leading icon</button>
        <button type="button" mudButton>Trailing icon <mud-icon name="chevron-bottom" [scale]="20" /></button>
        <button type="button" mudButton aria-label="Add"><mud-icon name="plus-large" [scale]="20" /></button>
      </div>
    `,
  }),
};

/** Icon-only transparent circular button. An `aria-label` is required. `size="small"` gives a 32px circle with a 16px glyph. */
export const IconButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudIconButton aria-label="Add"><mud-icon name="plus-large" [scale]="20" /></button>
        <button type="button" mudIconButton aria-label="Add" disabled><mud-icon name="plus-large" [scale]="20" /></button>
        <button type="button" mudIconButton size="small" aria-label="Add"><mud-icon name="plus-small" [scale]="16" /></button>
        <button type="button" mudIconButton size="small" aria-label="Add" disabled><mud-icon name="plus-small" [scale]="16" /></button>
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
        <button type="button" mudButton loading>Primary</button>
        <button type="button" mudButton color="secondary" loading>Secondary</button>
        <button type="button" mudButton color="strict" loading>Strict</button>
        <button type="button" mudButton color="neutral" loading>Neutral</button>
        <button type="button" mudButton color="destructive" loading>Destructive</button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <button type="button" mudButton disabled>Primary</button>
        <button type="button" mudButton color="secondary" disabled>Secondary</button>
        <button type="button" mudButton color="strict" disabled>Strict</button>
        <button type="button" mudButton color="neutral" disabled>Neutral</button>
        <button type="button" mudButton color="destructive" disabled>Destructive</button>
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
        <a mudButton href="https://egov.md" target="_blank" rel="noopener">Anchor filled</a>
        <a mudButton="outlined" href="https://egov.md" target="_blank" rel="noopener">Anchor outlined</a>
        <a mudButton href="https://egov.md" disabled>Anchor disabled</a>
      </div>
    `,
  }),
};
