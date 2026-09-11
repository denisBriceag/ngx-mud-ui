import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudSelectInput } from 'ngx-mud-ui/select-input';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px;min-height:360px';

const RAIONS: MudSelectOption<string>[] = [
  { value: 'chisinau', label: 'Chișinău' },
  { value: 'balti', label: 'Bălți' },
  { value: 'cahul', label: 'Cahul' },
  { value: 'orhei', label: 'Orhei' },
  { value: 'soroca', label: 'Soroca', disabled: true },
  { value: 'ungheni', label: 'Ungheni' },
];

const meta: Meta<MudSelectInput> = {
  title: 'Components/Select input',
  component: MudSelectInput,
  decorators: [moduleMetadata({ imports: [MudSelectInput, MudLabel, MudInlineMessage] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    placeholder: 'Alegeți raionul',
  },
};

export default meta;

type Story = StoryObj<MudSelectInput>;

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, options: RAIONS },
    template: `
      <div style="${COL}">
        <mud-select-input
          [variant]="variant"
          [size]="size"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [placeholder]="placeholder"
          [options]="options"
        >
          <mud-label>Raion</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Raionul de reședință.</mud-inline-message>
          }
        </mud-select-input>
      </div>
    `,
  }),
};

/** Keyboard: arrows open + move the highlight (focus stays on the trigger), Enter selects, Escape closes. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: RAIONS },
    template: `
      <div style="${COL}">
        <mud-select-input value="balti" [options]="options">
          <mud-label>Cu selecție</mud-label>
        </mud-select-input>
        <mud-select-input invalid [options]="options" placeholder="Alegeți">
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
        </mud-select-input>
        <mud-select-input value="chisinau" readonly [options]="options">
          <mud-label>Doar citire</mud-label>
        </mud-select-input>
        <mud-select-input disabled [options]="options" placeholder="Indisponibil">
          <mud-label>Dezactivat</mud-label>
        </mud-select-input>
        <mud-select-input [options]="[]" emptyText="Nicio opțiune disponibilă" placeholder="Gol">
          <mud-label>Fără opțiuni</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};

/** The group is a regular form control: reactive forms with a required validator. */
@Component({
  selector: 'mud-select-reactive-demo',
  imports: [MudSelectInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-select-input
        required
        placeholder="Alegeți raionul"
        [options]="options"
        [formControl]="raion"
        [invalid]="raion.touched && raion.invalid"
      >
        <mud-label>Raion</mud-label>
        @if (raion.touched && raion.invalid) {
          <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
        }
      </mud-select-input>
      <code>value: {{ raion.value || '—' }} | touched: {{ raion.touched }} | valid: {{ raion.valid }}</code>
    </div>
  `,
})
class SelectReactiveDemo {
  readonly options = RAIONS;
  readonly raion = new FormControl<string | null>(null, { validators: [Validators.required] });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudSelectInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-select-input
      required
      placeholder="Alegeți raionul"
      [options]="options"
      [formControl]="raion"
      [invalid]="raion.touched && raion.invalid"
    >
      <mud-label>Raion</mud-label>
      @if (raion.touched && raion.invalid) {
        <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
      }
    </mud-select-input>
  \`,
})
export class RaionField {
  // Options are data, not projected content — there is no mud-option element.
  readonly options: readonly MudSelectOption<string>[] = [
    { value: 'ch', label: 'Chișinău' },
    { value: 'bl', label: 'Bălți' },
  ];
  readonly raion = new FormControl<string | null>(null, { validators: [Validators.required] });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SelectReactiveDemo] })],
  render: () => ({ template: `<mud-select-reactive-demo />` }),
};

/** Non-string values with Object.is comparison. */
@Component({
  selector: 'mud-select-number-demo',
  imports: [MudSelectInput, MudLabel],
  template: `
    <div style="${COL}">
      <mud-select-input placeholder="Alegeți" [options]="options" [(value)]="copies">
        <mud-label>Numărul de exemplare</mud-label>
      </mud-select-input>
      <code>copies: {{ copies() ?? '—' }} (number)</code>
    </div>
  `,
})
class SelectNumberDemo {
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
    { value: 5, label: 'Cinci exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const NON_STRING_VALUES_SOURCE = `
@Component({
  imports: [MudSelectInput, MudLabel],
  template: \`
    <mud-select-input placeholder="Alegeți" [options]="options" [(value)]="copies">
      <mud-label>Numărul de exemplare</mud-label>
    </mud-select-input>
  \`,
})
export class CopiesSelect {
  // The component is generic in the option value, so \`copies\` stays a number.
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
    { value: 5, label: 'Cinci exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}
`;

export const NonStringValues: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: NON_STRING_VALUES_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SelectNumberDemo] })],
  render: () => ({ template: `<mud-select-number-demo />` }),
};
