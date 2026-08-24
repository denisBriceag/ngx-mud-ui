import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px';

const meta: Meta<MudNumericInput> = {
  title: 'Components/Numeric input',
  component: MudNumericInput,
  decorators: [moduleMetadata({ imports: [MudNumericInput] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    precision: { control: 'number' },
    locale: { control: 'text' },
    showSteppers: { control: 'boolean' },
    allowDecimal: { control: 'boolean' },
    allowNegative: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    step: 1,
    showSteppers: true,
    allowDecimal: true,
    allowNegative: true,
    clearable: false,
    disabled: false,
    readonly: false,
    invalid: false,
    loading: false,
    label: 'Cantitate',
    helperText: 'Numărul de exemplare solicitate.',
    placeholder: '0',
  },
};

export default meta;

type Story = StoryObj<MudNumericInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-numeric-input
          [variant]="variant"
          [size]="size"
          [min]="min"
          [max]="max"
          [step]="step"
          [precision]="precision"
          [locale]="locale"
          [showSteppers]="showSteppers"
          [allowDecimal]="allowDecimal"
          [allowNegative]="allowNegative"
          [clearable]="clearable"
          [disabled]="disabled"
          [readonly]="readonly"
          [invalid]="invalid"
          [loading]="loading"
          [label]="label"
          [helperText]="helperText"
          [errorText]="errorText"
          [placeholder]="placeholder"
        />
      </div>
    `,
  }),
};

/**
 * Locale formatting with a leading icon and a currency suffix: 1250.5 renders
 * as "1.250,50" under ro-MD. `icon-start` is the square icon box; `prefix` /
 * `suffix` are auto-width text affixes.
 */
@Component({
  selector: 'mud-numeric-currency-demo',
  imports: [MudNumericInput],
  template: `
    <div style="${COL}">
      <mud-numeric-input
        label="Suma de achitat"
        locale="ro-MD"
        [precision]="2"
        [min]="0"
        [max]="100000"
        [allowNegative]="false"
        [(value)]="amount"
        placeholder="0,00"
      >
        <svg icon-start xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.167 3.333A2.5 2.5 0 0 0 1.667 5.833v8.334a2.5 2.5 0 0 0 2.5 2.5h11.666a2.5 2.5 0 0 0 2.5-2.5v-5a2.5 2.5 0 0 0-2.5-2.5H4.167a.833.833 0 0 1 0-1.667h10a.833.833 0 0 0 0-1.667zm9.166 8.75a1.042 1.042 0 1 1 2.084 0 1.042 1.042 0 0 1-2.084 0"
          />
        </svg>
        <span suffix>MDL</span>
      </mud-numeric-input>
      <code>value: {{ amount() ?? '—' }} (number)</code>
    </div>
  `,
})
class NumericCurrencyDemo {
  readonly amount = signal<number | null>(1250.5);
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const LOCALE_CURRENCY_SOURCE = `
@Component({
  imports: [MudNumericInput],
  template: \`
    <mud-numeric-input
      label="Suma de achitat"
      locale="ro-MD"
      [precision]="2"
      [min]="0"
      [max]="100000"
      [allowNegative]="false"
      [(value)]="amount"
      placeholder="0,00"
    >
      <svg icon-start viewBox="0 0 20 20" aria-hidden="true"><!-- card glyph --></svg>
      <span suffix>MDL</span>
    </mud-numeric-input>
  \`,
})
export class AmountField {
  // \`locale\` drives display AND lenient parsing: 1250.5 renders as "1.250,5".
  readonly amount = signal<number | null>(1250.5);
}
`;

export const LocaleCurrency: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: LOCALE_CURRENCY_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [NumericCurrencyDemo] })],
  render: () => ({ template: `<mud-numeric-currency-demo />` }),
};

/** Steppers + ArrowUp/ArrowDown step; buttons disable at the bounds. */
export const SteppersAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-numeric-input label="Cu steppers (0–10)" [min]="0" [max]="10" showSteppers [value]="8" />
        <mud-numeric-input label="Doar întregi, fără negative" [allowDecimal]="false" [allowNegative]="false" showSteppers />
        <mud-numeric-input label="Eroare" invalid errorText="Valoarea depășește limita." [value]="120" />
        <mud-numeric-input label="Doar citire" readonly [value]="42" />
        <mud-numeric-input label="Dezactivat" disabled [value]="7" showSteppers />
        <mud-numeric-input label="Se încarcă" loading [value]="99" showSteppers />
      </div>
    `,
  }),
};

/** Reactive forms with number values and validators. */
@Component({
  selector: 'mud-numeric-reactive-demo',
  imports: [MudNumericInput, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-numeric-input
        label="Numărul de copii"
        required
        [min]="1"
        [max]="10"
        showSteppers
        [allowDecimal]="false"
        [formControl]="copies"
        [invalid]="copies.touched && copies.invalid"
        errorText="Introduceți un număr între 1 și 10."
      />
      <code>value: {{ copies.value ?? '—' }} | valid: {{ copies.valid }}</code>
    </div>
  `,
})
class NumericReactiveDemo {
  readonly copies = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.max(10)],
  });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudNumericInput, ReactiveFormsModule],
  template: \`
    <mud-numeric-input
      label="Numărul de copii"
      required
      [min]="1"
      [max]="10"
      showSteppers
      [allowDecimal]="false"
      [formControl]="copies"
      [invalid]="copies.touched && copies.invalid"
      errorText="Introduceți un număr între 1 și 10."
    />
  \`,
})
export class CopiesField {
  // The empty value is null, not 0. Clamping to min/max happens on commit.
  readonly copies = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.max(10)],
  });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [NumericReactiveDemo] })],
  render: () => ({ template: `<mud-numeric-reactive-demo />` }),
};
