import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudIconComponent, provideMudIcons, sparkles } from 'ngx-mud-ui/icons';
import { MudTextInput } from 'ngx-mud-ui/text-input';
import { MudLabel } from 'ngx-mud-ui/label';

const COL = 'display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px';
const ROW = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<MudInlineMessage> = {
  title: 'Components/Inline message',
  component: MudInlineMessage,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([sparkles])] }),
    moduleMetadata({ imports: [MudInlineMessage, MudIconComponent, MudTextInput, MudLabel] }),
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
 * Two ways to attach a message to a real `mud-text-input`.
 *
 * **Projected** is the usual one: project a `mud-inline-message` into the
 * field and it wires `aria-describedby` itself, announcing it through its own
 * `role="alert"` wrapper.
 *
 * **External** is for a message rendered outside the field, such as a summary
 * shared by several controls: give it an `id` and point the field's
 * `aria-describedby` at it instead, leaving nothing projected into the field.
 */
export const AsFieldError: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL};gap:32px;max-width:420px;align-items:stretch">
        <mud-text-input value="12345" [maxLength]="13" invalid>
          <mud-label>IDNP</mud-label>
          <mud-inline-message variant="error">
            IDNP-ul trebuie să conțină 13 cifre.
          </mud-inline-message>
        </mud-text-input>

        <div style="display:flex;flex-direction:column;gap:8px;width:100%">
          <mud-text-input value="12345" aria-describedby="idnp-error" invalid>
            <mud-label>IDNP</mud-label>
          </mud-text-input>
          <mud-inline-message variant="error" size="small" id="idnp-error">
            IDNP-ul trebuie să conțină 13 cifre.
          </mud-inline-message>
        </div>
      </div>
    `,
  }),
};
