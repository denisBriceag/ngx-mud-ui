import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import type { MudInputChipError } from 'ngx-mud-ui/input-chip';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:480px;padding:24px';

const meta: Meta<MudInputChip> = {
  title: 'Components/Input chip',
  component: MudInputChip,
  decorators: [moduleMetadata({ imports: [MudInputChip] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    maxChips: { control: 'number' },
    separators: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    placeholder: { control: 'text' },
    removeLabel: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    separators: ',',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    label: 'Destinatari',
    helperText: 'Confirmați fiecare adresă cu Enter sau virgulă.',
    placeholder: 'nume@exemplu.md',
    removeLabel: 'Elimină',
  },
};

export default meta;

type Story = StoryObj<MudInputChip>;

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, chips: ['ana@exemplu.md', 'ion@exemplu.md'] },
    template: `
      <div style="${COL}">
        <mud-input-chip
          [variant]="variant"
          [size]="size"
          [maxChips]="maxChips"
          [separators]="separators"
          [disabled]="disabled"
          [readonly]="readonly"
          [invalid]="invalid"
          [required]="required"
          [label]="label"
          [helperText]="helperText"
          [errorText]="errorText"
          [placeholder]="placeholder"
          [removeLabel]="removeLabel"
          [value]="chips"
        />
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { chips: ['ana@exemplu.md', 'ion@exemplu.md'] },
    template: `
      <div style="${COL}">
        <mud-input-chip label="Implicit" placeholder="nume@exemplu.md" [value]="chips" />
        <mud-input-chip label="Eroare" invalid errorText="Cel puțin o adresă este invalidă." [value]="chips" />
        <mud-input-chip label="Doar citire" readonly [value]="chips" />
        <mud-input-chip label="Dezactivat" disabled [value]="chips" />
        <mud-input-chip label="Mare" size="large" [value]="chips" />
      </div>
    `,
  }),
};

/**
 * Email validation with maxChips: rejected values (pattern / duplicate / max)
 * emit `errored` and are announced via the live region. Paste a comma or
 * newline separated list to add several at once.
 */
@Component({
  selector: 'mud-input-chip-validation-demo',
  imports: [MudInputChip],
  template: `
    <div style="${COL}">
      <mud-input-chip
        label="Destinatari (max 3)"
        placeholder="nume@exemplu.md"
        helperText="Doar adrese de e-mail; maximum 3."
        [maxChips]="3"
        [validatePattern]="emailPattern"
        [(value)]="chips"
        (errored)="lastError.set($event)"
      />
      <code>chips: {{ chips().join(' | ') || '—' }}</code>
      @if (lastError(); as error) {
        <code>respins: {{ error.code }} ({{ error.value }})</code>
      }
    </div>
  `,
})
class InputChipValidationDemo {
  readonly emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  readonly chips = signal<string[]>(['ana@exemplu.md']);
  readonly lastError = signal<MudInputChipError | null>(null);
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const VALIDATION_SOURCE = `
@Component({
  imports: [MudInputChip],
  template: \`
    <mud-input-chip
      label="Destinatari (max 3)"
      placeholder="nume@exemplu.md"
      helperText="Doar adrese de e-mail; maximum 3."
      [maxChips]="3"
      [validatePattern]="emailPattern"
      [(value)]="chips"
      (errored)="lastError.set($event)"
    />
  \`,
})
export class RecipientsField {
  // \`validatePattern\`, not \`pattern\`: signal forms auto-bind a member called
  // \`pattern\` with an incompatible protocol.
  readonly emailPattern = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
  readonly chips = signal<string[]>(['ana@exemplu.md']);

  // \`errored\` fires for every rejected value, with code 'pattern' | 'duplicate' | 'max'.
  readonly lastError = signal<MudInputChipError | null>(null);
}
`;

export const ValidationAndMax: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: VALIDATION_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [InputChipValidationDemo] })],
  render: () => ({ template: `<mud-input-chip-validation-demo />` }),
};

/** Reactive forms: the control value is the chips array itself. */
@Component({
  selector: 'mud-input-chip-reactive-demo',
  imports: [MudInputChip, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-input-chip
        label="Etichete"
        placeholder="Adăugați o etichetă"
        [formControl]="tags"
        [invalid]="tags.touched && tags.invalid"
        errorText="Adăugați cel puțin o etichetă."
      />
      <code>value: {{ tags.value.join(', ') || '—' }}</code>
    </div>
  `,
})
class InputChipReactiveDemo {
  readonly tags = new FormControl<string[]>(['acte', 'urgent'], { nonNullable: true });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudInputChip, ReactiveFormsModule],
  template: \`
    <mud-input-chip
      label="Etichete"
      placeholder="Adăugați o etichetă"
      [formControl]="tags"
      [invalid]="tags.touched && tags.invalid"
      errorText="Adăugați cel puțin o etichetă."
    />
  \`,
})
export class TagsField {
  // The form value is the confirmed chips; unconfirmed draft text is separate.
  readonly tags = new FormControl<string[]>(['acte', 'urgent'], { nonNullable: true });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [InputChipReactiveDemo] })],
  render: () => ({ template: `<mud-input-chip-reactive-demo />` }),
};
