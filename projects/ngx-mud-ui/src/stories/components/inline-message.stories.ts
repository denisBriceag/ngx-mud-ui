import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import { MudIconComponent, provideMudIcons, sparkles } from '../../../icons/src/public-api';

const COL = 'display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px';
const ROW = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<MudInlineMessage> = {
  title: 'Components/Inline message',
  component: MudInlineMessage,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([sparkles])] }),
    moduleMetadata({ imports: [MudInlineMessage, MudIconComponent] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'warning', 'success', 'error'] },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    hideIcon: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    size: 'medium',
    hideIcon: false,
  },
};

export default meta;

type Story = StoryObj<MudInlineMessage>;

/**
 * The lightweight icon + text feedback line: no surface, border, or padding.
 * `info` keeps neutral text with a brand-blue icon; the other variants color
 * both icon and text.
 */
export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-inline-message [variant]="variant" [size]="size" [hideIcon]="hideIcon">
          Documentele se procesează în 3–5 zile lucrătoare.
        </mud-inline-message>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-inline-message variant="info">Completați toate câmpurile obligatorii.</mud-inline-message>
        <mud-inline-message variant="warning">Sesiunea expiră în 2 minute.</mud-inline-message>
        <mud-inline-message variant="success">Documentul a fost semnat.</mud-inline-message>
        <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
      </div>
    `,
  }),
};

/** medium = 14/20 with a 20px icon and 6px gap; small = 12/16, 16px icon, 4px gap. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
        <mud-inline-message variant="error" size="small">Introduceți un IDNP valid.</mud-inline-message>
      </div>
    `,
  }),
};

/** `hideIcon` renders the text-only variation; a projected icon replaces the default glyph. */
export const IconVariations: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-inline-message variant="info" hideIcon>Fără pictogramă.</mud-inline-message>
        <mud-inline-message variant="info">
          <mud-icon name="sparkles" [scale]="20" />
          Pictogramă personalizată proiectată.
        </mud-inline-message>
      </div>
    `,
  }),
};

/**
 * Long messages wrap; the icon stays centered on the FIRST line
 * (its box matches the line height).
 */
export const Wrapping: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL};max-width:320px">
        <mud-inline-message variant="warning">
          Cererea dumneavoastră va fi procesată doar după achitarea taxei de stat
          și confirmarea identității prin MPass.
        </mud-inline-message>
      </div>
    `,
  }),
};

/**
 * The intended form-field wiring: the message is plain text (NOT a live
 * region), associated with the input via aria-describedby, with aria-invalid
 * set on the field itself.
 */
export const AsFieldError: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <label for="idnp" style="font:500 14px/20px var(--font-family-primary)">IDNP</label>
        <input
          id="idnp"
          value="12345"
          aria-invalid="true"
          aria-describedby="idnp-error"
          style="padding:8px 12px;border:1px solid var(--color-border-danger-default);border-radius:6px"
        />
        <mud-inline-message variant="error" size="small" id="idnp-error">
          IDNP-ul trebuie să conțină 13 cifre.
        </mud-inline-message>
      </div>
    `,
  }),
};
