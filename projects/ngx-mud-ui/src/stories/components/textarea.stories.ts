import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudTextarea } from '../../../textarea/src/public-api';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

const meta: Meta<MudTextarea> = {
  title: 'Components/Textarea',
  component: MudTextarea,
  decorators: [moduleMetadata({ imports: [MudTextarea] })],
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
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
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
    label: 'Mesaj',
    helperText: 'Descrieți problema întâlnită.',
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
          [label]="label"
          [helperText]="helperText"
          [errorText]="errorText"
          [placeholder]="placeholder"
        />
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
        <mud-textarea
          label="Cu contor"
          [maxLength]="200"
          helperText="Maxim 200 de caractere."
          value="Un început de mesaj."
          counterLabel="20 din 200 de caractere"
        />
        <mud-textarea label="Eroare" [maxLength]="200" invalid errorText="Mesajul este obligatoriu." />
        <mud-textarea label="Doar contor" [maxLength]="200" value="Fără helper." />
        <mud-textarea label="Dezactivat" [maxLength]="200" disabled value="Nu poate fi editat." />
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
        <mud-textarea label="Redimensionabil vertical" helperText="Trageți de colț." />
        <mud-textarea label="Fără redimensionare" resize="none" />
        <mud-textarea label="Large" size="large" placeholder="16/24, min 150px" />
      </div>
    `,
  }),
};

/**
 * Truncation rules shared with mud-input: the label clamps to ONE line,
 * assistive text to TWO lines.
 */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL};max-width:280px">
        <mud-textarea
          label="O etichetă foarte foarte lungă care nu ar trebui să treacă niciodată pe al doilea rând"
          helperText="Un text asistiv foarte lung care se întinde pe mai multe rânduri dar care trebuie tăiat cu puncte de suspensie după exact două rânduri de text vizibil."
          [maxLength]="100"
        />
      </div>
    `,
  }),
};
