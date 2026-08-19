import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { EgovSpinner } from '../../../spinner/src/public-api';

const ROW = 'display:flex;gap:32px;align-items:center;flex-wrap:wrap;padding:24px';
const DARK_TILE =
  'display:inline-flex;align-items:center;justify-content:center;padding:16px;' +
  'border-radius:8px;background:var(--color-background-base-inverse-default)';
const BRAND_TILE =
  'display:inline-flex;align-items:center;justify-content:center;padding:16px;' +
  'border-radius:8px;background:var(--color-background-brand-default)';

const meta: Meta<EgovSpinner> = {
  title: 'Components/Spinner',
  component: EgovSpinner,
  decorators: [moduleMetadata({ imports: [EgovSpinner] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['extra-small', 'small', 'medium', 'large'] },
    variant: {
      control: 'inline-radio',
      options: ['brand', 'dark', 'light', 'light-on-color'],
      description: 'light/light-on-color are meant for dark and colored surfaces',
    },
    ariaLabel: {
      name: 'aria-label',
      control: 'text',
      description: 'Announced via role="status"; override with a localized label',
    },
  },
  args: {
    size: 'medium',
    variant: 'brand',
    ariaLabel: 'Loading',
  },
};

export default meta;

type Story = StoryObj<EgovSpinner>;

export const Playground: Story = {
  // `ariaLabel` is renamed before it reaches the template props — Storybook's
  // Angular wrapper direct-assigns props that don't match an input TEMPLATE
  // name (the alias is "aria-label") onto the component instance, which would
  // overwrite the input signal ("ctx.ariaLabel is not a function").
  render: ({ ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${ROW}">
        <egov-spinner [size]="size" [variant]="variant" [aria-label]="ariaLabelText" />
      </div>
    `,
  }),
};

/** Diameters: extra-small 16 / small 20 / medium 32 / large 40. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <egov-spinner size="extra-small" />
        <egov-spinner size="small" />
        <egov-spinner size="medium" />
        <egov-spinner size="large" />
      </div>
    `,
  }),
};

/** light and light-on-color exist for dark and brand-colored surfaces. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <egov-spinner variant="brand" />
        <egov-spinner variant="dark" />
        <span style="${DARK_TILE}"><egov-spinner variant="light" /></span>
        <span style="${BRAND_TILE}"><egov-spinner variant="light-on-color" /></span>
      </div>
    `,
  }),
};
