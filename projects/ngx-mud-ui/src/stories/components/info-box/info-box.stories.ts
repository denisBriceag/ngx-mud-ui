import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudInfoBox } from 'ngx-mud-ui/info-box';
import { MudLink } from 'ngx-mud-ui/link';
import { MudButton } from 'ngx-mud-ui/button';

const COL = 'display:flex;flex-direction:column;gap:16px;padding:24px;max-width:720px';

// `ariaLabel` is aliased to `aria-label` on the component, so the Storybook
// arg key IS the string 'aria-label' — MudInfoBox itself has no such
// property. This type documents the alias for Meta/StoryObj instead of
// casting it away in the render signature.
type InfoBoxArgs = MudInfoBox & { 'aria-label'?: string };

const meta: Meta<InfoBoxArgs> = {
  title: 'Components/Info box',
  component: MudInfoBox,
  decorators: [moduleMetadata({ imports: [MudInfoBox, MudLink, MudButton] })],
  args: {
    variant: 'neutral',
    emphasis: 'subtle',
    closable: false,
    hideIcon: false,
    closeLabel: 'Close',
  },
};

export default meta;

type Story = StoryObj<InfoBoxArgs>;

export const Playground: Story = {
  // Destructure the actual arg key, not `ariaLabel`, and pass it under a
  // non-colliding prop name. A raw `ariaLabel` prop (or the aliased key left
  // in `...args`) crashes the Storybook wrapper.
  render: ({ 'aria-label': ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${COL}">
        <mud-info-box
          [variant]="variant"
          [emphasis]="emphasis"
          [closable]="closable"
          [hideIcon]="hideIcon"
          [closeLabel]="closeLabel"
          [aria-label]="ariaLabelText"
        >
          <p heading>Before you begin</p>
          You will need your IDNP and a scanned copy of your passport.
        </mud-info-box>
      </div>
    `,
  }),
};

const CAPTION = 'margin:8px 0 0;font-family:var(--mud-font-family-base);font-size:14px;line-height:20px;font-weight:600;color:var(--mud-color-text-base-secondary)';

/**
 * Every `variant` × `emphasis` pair. Subtle boxes share the grey surface and differ by icon; strong boxes
 * tint the surface. Strong neutral and strong moderate look the same, as upstream draws them.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <p style="${CAPTION}">Subtle (default)</p>
        <mud-info-box variant="neutral">Neutral. Quiet, informational: grey icon.</mud-info-box>
        <mud-info-box variant="moderate">Moderate. Brand-blue icon.</mud-info-box>
        <mud-info-box variant="warning">Warning. Check this before continuing.</mud-info-box>
        <mud-info-box variant="error">Error. This application could not be submitted.</mud-info-box>

        <p style="${CAPTION}">Strong</p>
        <mud-info-box variant="neutral" emphasis="strong">Neutral, strong. Tinted blue surface.</mud-info-box>
        <mud-info-box variant="moderate" emphasis="strong">Moderate, strong. The same tinted blue surface.</mud-info-box>
        <mud-info-box variant="warning" emphasis="strong">
          <p heading>The deadline is tomorrow</p>
          Submit the application before 23:59, or start again next month.
          <a actions mudLink href="/help">What happens after the deadline?</a>
        </mud-info-box>
        <mud-info-box variant="error" emphasis="strong">
          <p heading>Your application was rejected</p>
          The scanned passport is unreadable. Upload a clearer copy and submit again.
          <button actions mudButton="outlined" size="small">Upload again</button>
        </mud-info-box>
      </div>
    `,
  }),
};

/**
 * The heading is a slot, not an input, so the element is yours — the second box
 * clamps its own title to one line, which the box itself never imposes.
 */
export const WithHeading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-info-box variant="moderate" emphasis="strong">
          <p heading>Before you begin</p>
          You will need your IDNP and a scanned copy of your passport. Applications
          submitted without both documents are returned automatically.
        </mud-info-box>

        <mud-info-box variant="neutral">
          <p heading style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            A heading long enough that the consumer decides to clamp it to a single line
          </p>
          The truncation lives in your template, not in the component.
        </mud-info-box>
      </div>
    `,
  }),
};

/**
 * Actions are projected, so they can be links, buttons, with or without icons.
 * The box pins the metrics regardless of what you pass: buttons render at the
 * `small` 32px height and links at the `medium` 24px line box.
 */
export const WithActions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-info-box variant="moderate">
          <p heading>Your session is about to expire</p>
          You will be signed out in two minutes.
          <button actions mudButton="filled" size="small">Stay signed in</button>
          <a actions mudLink href="/help">What does this mean?</a>
        </mud-info-box>
      </div>
    `,
  }),
};

export const Closable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { onClosed: () => undefined },
    template: `
      <div style="${COL}">
        <mud-info-box variant="neutral" closable (closed)="onClosed()">
          <p heading>Closing is yours to handle</p>
          Closing emits an event — the consumer removes the box. The button sits
          10px from the top-right corner, and the box reserves the inline room it
          needs so this text never runs underneath it, however long it gets.
        </mud-info-box>
      </div>
    `,
  }),
};

export const WithoutIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-info-box variant="neutral" hideIcon>
          <p heading>No icon</p>
          The icon region is removed entirely, not just hidden.
        </mud-info-box>
      </div>
    `,
  }),
};
