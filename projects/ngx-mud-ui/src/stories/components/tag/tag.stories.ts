import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
import { checkmarkSmall, chevronRightSmall, circleInfo } from 'ngx-mud-ui/icons';

const ROW = 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:24px';
const COLORS = ['muted', 'neutral', 'accent', 'success', 'brand', 'danger', 'info'] as const;

const meta: Meta<MudTag> = {
  title: 'Components/Tag',
  component: MudTag,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([checkmarkSmall, chevronRightSmall, circleInfo])] }),
    moduleMetadata({ imports: [MudTag, MudIconComponent] }),
  ],
  argTypes: {
    color: { control: 'select', options: [...COLORS] },
    type: {
      control: 'inline-radio',
      options: ['subtle', 'strong', 'outlined'],
      description: 'info supports only subtle and strong; outlined falls back to subtle with a dev warning',
    },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    disabled: { control: 'boolean' },
  },
  args: {
    color: 'success',
    type: 'subtle',
    size: 'medium',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<MudTag>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <mud-tag [color]="color" [type]="type" [size]="size" [disabled]="disabled">Label</mud-tag>
      </div>
    `,
  }),
};

export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { colors: COLORS },
    template: `
      @for (color of colors; track color) {
        <div style="${ROW};padding:8px 24px">
          <mud-tag [color]="color" type="subtle">Label</mud-tag>
          <mud-tag [color]="color" type="strong">Label</mud-tag>
          @if (color !== 'info') {
            <mud-tag [color]="color" type="outlined">Label</mud-tag>
          }
          <span style="width:8ch;color:var(--mud-color-text-base-secondary)">{{ color }}</span>
        </div>
      }
    `,
  }),
};

/** Disabled replaces every color with the disabled pair; outlined keeps its transparent fill. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-tag color="success" disabled>Subtle</mud-tag>
        <mud-tag color="danger" type="strong" disabled>Strong</mud-tag>
        <mud-tag color="brand" type="outlined" disabled>Outlined</mud-tag>
        <mud-tag color="success" disabled>
          <mud-icon icon-start name="checkmark-small" [scale]="16" />
          With icon
        </mud-tag>
      </div>
    `,
  }),
};

/** Medium is 24px tall (14/20 text), small is 20px (12/16 text). */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-tag color="brand" type="strong">Medium</mud-tag>
        <mud-tag color="brand" type="strong" size="small">Small</mud-tag>
      </div>
    `,
  }),
};

/**
 * Mark an icon `icon-start` or `icon-end`. It tightens only its own edge
 * (6px on medium, 4px on small) and is forced to 16px (medium) / 12px (small).
 * Pass `scale="16"` so the icon geometry matches the rendered size.
 */
export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-tag color="success">
          <mud-icon icon-start name="checkmark-small" [scale]="16" /> Approved
        </mud-tag>
        <mud-tag color="info" type="strong">
          <mud-icon icon-start name="circle-info" [scale]="16" /> In review
        </mud-tag>
        <mud-tag color="brand">
          Details <mud-icon icon-end name="chevron-right-small" [scale]="16" />
        </mud-tag>
        <mud-tag color="neutral" type="outlined">
          <mud-icon icon-start name="circle-info" [scale]="16" /> Both
          <mud-icon icon-end name="chevron-right-small" [scale]="16" />
        </mud-tag>
        <mud-tag color="danger" type="outlined" size="small">
          <mud-icon icon-start name="circle-info" [scale]="16" /> Rejected
        </mud-tag>
        <mud-tag color="brand" size="small">
          Details <mud-icon icon-end name="chevron-right-small" [scale]="16" />
        </mud-tag>
      </div>
    `,
  }),
};

/**
 * A tag is a11y-silent by default. Give it an `aria-label` and it becomes a
 * polite live region (`role="status"`), so content changes are announced —
 * use this for tags that reflect changing state (e.g. a payment status).
 */
export const AnnouncedStatus: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-tag color="success" aria-label="Payment status">Paid</mud-tag>
        <mud-tag color="neutral">Decorative, not announced</mud-tag>
      </div>
    `,
  }),
};
