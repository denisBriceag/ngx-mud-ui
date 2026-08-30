import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudLink } from 'ngx-mud-ui/link';

const COL = 'display:flex;flex-direction:column;gap:16px;padding:24px';

// `ariaLabel` is aliased to `aria-label` on the component, so the Storybook
// arg key IS the string 'aria-label' — MudBanner itself has no such property.
// This type documents the alias for Meta/StoryObj instead of casting it away
// in the render signature.
type BannerArgs = MudBanner & { 'aria-label'?: string };

const meta: Meta<BannerArgs> = {
  title: 'Components/Banner',
  component: MudBanner,
  decorators: [moduleMetadata({ imports: [MudBanner, MudLink] })],
  args: {
    variant: 'info',
    type: 'subtle',
    dismissible: false,
    live: false,
    closeLabel: 'Close',
  },
};

export default meta;

type Story = StoryObj<BannerArgs>;

export const Playground: Story = {
  // Destructure the actual arg key, not `ariaLabel`, and pass it under a
  // non-colliding prop name. A raw `ariaLabel` prop (or the aliased key left
  // in `...args`) crashes the Storybook wrapper.
  render: ({ 'aria-label': ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${COL}">
        <mud-banner
          [variant]="variant"
          [type]="type"
          [dismissible]="dismissible"
          [live]="live"
          [closeLabel]="closeLabel"
          [aria-label]="ariaLabelText"
        >
          Scheduled maintenance tonight 22:00–00:00.
        </mud-banner>
      </div>
    `,
  }),
};

/** All six combinations: three variants across both types. */
export const Variants: Story = {
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-banner variant="info">Informational system message.</mud-banner>
        <mud-banner variant="warning">Scheduled maintenance tonight.</mud-banner>
        <mud-banner variant="error">Payments are currently unavailable.</mud-banner>
        <mud-banner variant="info" type="strong">Informational system message.</mud-banner>
        <mud-banner variant="warning" type="strong">Scheduled maintenance tonight.</mud-banner>
        <mud-banner variant="error" type="strong">Payments are currently unavailable.</mud-banner>
      </div>
    `,
  }),
};

/** The link is projected, so it can be a routerLink — upstream's linkText/linkHref cannot. */
export const WithLink: Story = {
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-banner variant="warning">
          Scheduled maintenance tonight 22:00–00:00.
          <a mudLink href="/status">Details</a>
        </mud-banner>
      </div>
    `,
  }),
};

export const Dismissible: Story = {
  render: () => ({
    props: { onDismissed: () => undefined },
    template: `
      <div style="${COL}">
        <mud-banner variant="info" dismissible (dismissed)="onDismissed()">
          Dismissing emits an event — the consumer removes the banner.
        </mud-banner>
      </div>
    `,
  }),
};
