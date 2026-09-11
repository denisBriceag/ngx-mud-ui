import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import type { MudInputChipError } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:480px;padding:24px';

const meta: Meta<MudInputChip> = {
  title: 'Components/Input chip',
  component: MudInputChip,
  decorators: [moduleMetadata({ imports: [MudInputChip, MudLabel, MudInlineMessage] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    maxChips: { control: 'number' },
    separators: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
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
          [placeholder]="placeholder"
          [removeLabel]="removeLabel"
          [value]="chips"
        >
          <mud-label>Destinatari</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Cel puțin o adresă este invalidă.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Confirmați fiecare adresă cu Enter sau virgulă.</mud-inline-message>
          }
        </mud-input-chip>
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
        <mud-input-chip placeholder="nume@exemplu.md" [value]="chips">
          <mud-label>Implicit</mud-label>
        </mud-input-chip>
        <mud-input-chip invalid [value]="chips">
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Cel puțin o adresă este invalidă.</mud-inline-message>
        </mud-input-chip>
        <mud-input-chip readonly [value]="chips">
          <mud-label>Doar citire</mud-label>
        </mud-input-chip>
        <mud-input-chip disabled [value]="chips">
          <mud-label>Dezactivat</mud-label>
        </mud-input-chip>
        <mud-input-chip size="large" [value]="chips">
          <mud-label>Mare</mud-label>
        </mud-input-chip>
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
  imports: [MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <div style="${COL}">
      <mud-input-chip
        placeholder="nume@exemplu.md"
        [maxChips]="3"
        [validatePattern]="emailPattern"
        [(value)]="chips"
        (errored)="lastError.set($event)"
      >
        <mud-label>Destinatari (max 3)</mud-label>
        <mud-inline-message hideIcon>Doar adrese de e-mail; maximum 3.</mud-inline-message>
      </mud-input-chip>
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
  imports: [MudInputChip, MudLabel, MudInlineMessage],
  template: \`
    <mud-input-chip
      placeholder="nume@exemplu.md"
      [maxChips]="3"
      [validatePattern]="emailPattern"
      [(value)]="chips"
      (errored)="lastError.set($event)"
    >
      <mud-label>Destinatari (max 3)</mud-label>
      <mud-inline-message hideIcon>Doar adrese de e-mail; maximum 3.</mud-inline-message>
    </mud-input-chip>
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
  imports: [MudInputChip, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-input-chip
        placeholder="Adăugați o etichetă"
        [formControl]="tags"
        [invalid]="tags.touched && tags.invalid"
      >
        <mud-label>Etichete</mud-label>
        @if (tags.touched && tags.invalid) {
          <mud-inline-message variant="error">Adăugați cel puțin o etichetă.</mud-inline-message>
        }
      </mud-input-chip>
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
  imports: [MudInputChip, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-input-chip
      placeholder="Adăugați o etichetă"
      [formControl]="tags"
      [invalid]="tags.touched && tags.invalid"
    >
      <mud-label>Etichete</mud-label>
      @if (tags.touched && tags.invalid) {
        <mud-inline-message variant="error">Adăugați cel puțin o etichetă.</mud-inline-message>
      }
    </mud-input-chip>
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
