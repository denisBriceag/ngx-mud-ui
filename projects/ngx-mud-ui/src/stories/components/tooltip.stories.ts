import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { MudTooltip, MUD_TOOLTIP_PLACEMENTS } from '../../../tooltip/src/public-api';

const BTN_STYLE =
  'padding:10px 16px;border:none;border-radius:6px;background:var(--blue-500,#20686f);color:var(--white,#fff);font-size:14px;cursor:pointer';

const meta: Meta<MudTooltip> = {
  title: 'Components/Tooltip',
  component: MudTooltip,
  decorators: [moduleMetadata({ imports: [MudTooltip] })],
  argTypes: {
    mudTooltip: { control: 'text', description: 'Tooltip message' },
    tooltipPlacement: { control: 'select', options: [...MUD_TOOLTIP_PLACEMENTS] },
    tooltipSize: { control: 'inline-radio', options: ['small', 'large'] },
    tooltipCloseable: { control: 'boolean' },
    tooltipDisabled: { control: 'boolean' },
    tooltipShowDelay: { control: 'number' },
    tooltipMaxWidth: { control: 'text' },
  },
  args: {
    mudTooltip: 'Moldova’s digital evolution is at the heart of seamless public service delivery.',
    tooltipPlacement: 'top-center',
    tooltipSize: 'small',
    tooltipCloseable: false,
    tooltipDisabled: false,
    tooltipShowDelay: 300,
    tooltipMaxWidth: '240px',
  },
};

export default meta;

type Story = StoryObj<MudTooltip>;

/** Hover or focus the trigger; dismiss with Escape. All inputs are adjustable via controls. */
export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;justify-content:center;padding:120px 24px">
        <button
          type="button"
          style="${BTN_STYLE}"
          [mudTooltip]="mudTooltip"
          [tooltipPlacement]="tooltipPlacement"
          [tooltipSize]="tooltipSize"
          [tooltipCloseable]="tooltipCloseable"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipShowDelay]="tooltipShowDelay"
          [tooltipMaxWidth]="tooltipMaxWidth"
        >
          Hover or focus me
        </button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex;gap:48px;justify-content:center;padding:120px 24px">
        <button type="button" style="${BTN_STYLE}" mudTooltip="Tooltip small." tooltipSize="small" [tooltipShowDelay]="0">
          small
        </button>
        <button type="button" style="${BTN_STYLE}" mudTooltip="Tooltip displayed above the element." tooltipSize="large" [tooltipShowDelay]="0">
          large
        </button>
      </div>
    `,
  }),
};

/**
 * All 12 placements: `{side}-{alignment}`. When a placement doesn't fit the
 * viewport, the tooltip flips to the opposite side and the arrow follows.
 */
export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,max-content);gap:56px 48px;justify-content:center;padding:140px 24px">
        ${MUD_TOOLTIP_PLACEMENTS.map(
          (placement) => `
          <button
            type="button"
            style="${BTN_STYLE}"
            mudTooltip="Moldova’s digital evolution is at the heart of seamless public service delivery."
            tooltipPlacement="${placement}"
            [tooltipShowDelay]="0"
          >
            ${placement}
          </button>`,
        ).join('')}
      </div>
    `,
  }),
};

/** Tooltips on inline/icon triggers. Triggers must be focusable so keyboard users can reach them. */
export const OnIconTrigger: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:center;justify-content:center;padding:120px 24px;font-size:14px">
        <p style="margin:0">
          Processing takes up to 5 working days
          <button
            type="button"
            aria-label="More information"
            style="border:none;background:none;cursor:pointer;font-size:16px;padding:4px"
            mudTooltip="This is an informational tooltip attached to inline content."
            [tooltipShowDelay]="0"
          >ℹ️</button>
        </p>
      </div>
    `,
  }),
};

/**
 * Onboarding-style tooltip: `tooltipCloseable` keeps it visible until the user
 * closes it (✕ button, Escape, or clicking outside) — hovering away does not
 * dismiss it. `show()`/`hide()` (via `#ref="mudTooltip"`) drive it from code,
 * e.g. for product tours.
 */
@Component({
  selector: 'mud-tooltip-onboarding-demo',
  imports: [MudTooltip],
  template: `
    <div style="display:flex;gap:12px;align-items:center;justify-content:center;padding:140px 24px">
      <button type="button" (click)="tooltip.show()">show()</button>
      <button type="button" (click)="tooltip.hide()">hide()</button>
      <code>tooltipDismissed × {{ dismissals() }}</code>
      <span style="width:48px"></span>
      <button
        #tooltip="mudTooltip"
        type="button"
        style="${BTN_STYLE}"
        mudTooltip="New! You can now track your application status here."
        tooltipPlacement="top-center"
        tooltipSize="large"
        tooltipCloseable
        [tooltipShowDelay]="0"
        (tooltipDismissed)="dismissals.set(dismissals() + 1)"
      >
        Application status
      </button>
    </div>
  `,
})
class TooltipOnboardingDemo {
  readonly dismissals = signal(0);
}

export const CloseableOnboarding: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [TooltipOnboardingDemo] })],
  render: () => ({ template: `<mud-tooltip-onboarding-demo />` }),
};
