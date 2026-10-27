import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudTextarea } from 'ngx-mud-ui/textarea';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

const meta: Meta<MudTextarea> = {
  title: 'Components/Form/Textarea',
  component: MudTextarea,
  decorators: [moduleMetadata({ imports: [MudTextarea, MudLabel, MudInlineMessage] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    resize: { control: 'inline-radio', options: ['vertical', 'none'] },
    rows: { control: 'number' },
    maxLength: { control: 'number' },
    showCounter: { control: 'boolean' },
    counterLabel: {
      control: 'text',
      description:
        'Consumer-owned screen-reader sentence for the counter (compute it yourself, e.g. `value.length + " din 500 de caractere"`); unset = the visible digits are announced as-is',
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    resize: 'vertical',
    rows: 4,
    maxLength: 500,
    showCounter: true,
    counterLabel: undefined,
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    placeholder: 'Scrieți aici...',
  },
};

export default meta;

type Story = StoryObj<MudTextarea>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-textarea
          [variant]="variant"
          [size]="size"
          [resize]="resize"
          [rows]="rows"
          [maxLength]="maxLength"
          [showCounter]="showCounter"
          [counterLabel]="counterLabel"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [placeholder]="placeholder"
        >
          <mud-label>Mesaj</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Mesajul este obligatoriu.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Descrieți problema întâlnită.</mud-inline-message>
          }
        </mud-textarea>
      </div>
    `,
  }),
};

/** The counter shares a row with the assistive line and turns danger-colored while invalid. */
export const CounterAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-textarea [maxLength]="200" value="Un început de mesaj." counterLabel="20 din 200 de caractere">
          <mud-label>Cu contor</mud-label>
          <mud-inline-message hideIcon>Maxim 200 de caractere.</mud-inline-message>
        </mud-textarea>
        <mud-textarea [maxLength]="200" invalid>
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Mesajul este obligatoriu.</mud-inline-message>
        </mud-textarea>
        <mud-textarea [maxLength]="200" value="Fără helper.">
          <mud-label>Doar contor</mud-label>
        </mud-textarea>
        <mud-textarea [maxLength]="200" disabled value="Nu poate fi editat.">
          <mud-label>Dezactivat</mud-label>
        </mud-textarea>
      </div>
    `,
  }),
};

/** vertical (default) allows dragging taller; none locks the size. Large = 150px min-height. */
export const ResizeAndSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-textarea>
          <mud-label>Redimensionabil vertical</mud-label>
          <mud-inline-message hideIcon>Trageți de colț.</mud-inline-message>
        </mud-textarea>
        <mud-textarea resize="none">
          <mud-label>Fără redimensionare</mud-label>
        </mud-textarea>
        <mud-textarea size="large" placeholder="16/24, min 150px">
          <mud-label>Large</mud-label>
        </mud-textarea>
      </div>
    `,
  }),
};

/**
 * Truncation rules shared with mud-text-input: the label clamps to ONE line,
 * assistive text to TWO lines.
 */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL};max-width:280px">
        <mud-textarea [maxLength]="100">
          <mud-label>O etichetă foarte foarte lungă care nu ar trebui să treacă niciodată pe al doilea rând</mud-label>
          <mud-inline-message hideIcon>
            Un text asistiv foarte lung care se întinde pe mai multe rânduri dar care trebuie tăiat cu puncte de
            suspensie după exact două rânduri de text vizibil.
          </mud-inline-message>
        </mud-textarea>
      </div>
    `,
  }),
};
