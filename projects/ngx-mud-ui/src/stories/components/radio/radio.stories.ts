import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

const COL = 'display:flex;flex-direction:column;gap:32px;max-width:420px;padding:24px';

const meta: Meta<MudRadioGroup> = {
  title: 'Components/Radio',
  component: MudRadioGroup,
  decorators: [moduleMetadata({ imports: [MudRadioGroup, MudRadio] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
    errorText: { control: 'text' },
  },
  args: {
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    label: 'Metoda de plată',
  },
};

export default meta;

type Story = StoryObj<MudRadioGroup>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-radio-group
          [size]="size"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [label]="label"
          [errorText]="errorText"
        >
          <mud-radio value="card" label="Card bancar" supportingText="Visa, Mastercard." />
          <mud-radio value="mpay" label="MPay" supportingText="Fără comision." />
          <mud-radio value="cash" label="Numerar la ghișeu" />
        </mud-radio-group>
      </div>
    `,
  }),
};

/** Arrow keys rove and select natively (shared name); Tab enters/leaves the group. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-radio-group label="Selectat" value="mpay">
          <mud-radio value="card" label="Card bancar" />
          <mud-radio value="mpay" label="MPay" />
        </mud-radio-group>
        <mud-radio-group label="Eroare" invalid errorText="Alegeți o metodă de plată." required>
          <mud-radio value="card" label="Card bancar" />
          <mud-radio value="mpay" label="MPay" />
        </mud-radio-group>
        <mud-radio-group label="Cu opțiune dezactivată" value="card">
          <mud-radio value="card" label="Card bancar" />
          <mud-radio value="cash" label="Numerar" disabled />
        </mud-radio-group>
        <mud-radio-group label="Grup dezactivat" value="card" disabled>
          <mud-radio value="card" label="Card bancar" />
          <mud-radio value="mpay" label="MPay" />
        </mud-radio-group>
        <mud-radio-group label="Mic (small)" size="small" value="mpay">
          <mud-radio value="card" label="Card bancar" supportingText="14/20 + dot 10px." />
          <mud-radio value="mpay" label="MPay" />
        </mud-radio-group>
      </div>
    `,
  }),
};

/** The group is the form control: reactive forms bind on mud-radio-group. */
@Component({
  selector: 'mud-radio-reactive-demo',
  imports: [MudRadioGroup, MudRadio, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-radio-group
        label="Metoda de plată"
        required
        [formControl]="method"
        [invalid]="method.touched && method.invalid"
        errorText="Alegeți o metodă de plată."
      >
        <mud-radio value="card" label="Card bancar" />
        <mud-radio value="mpay" label="MPay" />
        <mud-radio value="cash" label="Numerar" />
      </mud-radio-group>
      <code>value: {{ method.value || '—' }} | touched: {{ method.touched }} | valid: {{ method.valid }}</code>
    </div>
  `,
})
class RadioReactiveDemo {
  readonly method = new FormControl<string | null>(null, { validators: [Validators.required] });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudRadioGroup, MudRadio, ReactiveFormsModule],
  template: \`
    <mud-radio-group
      label="Metoda de plată"
      required
      [formControl]="method"
      [invalid]="method.touched && method.invalid"
      errorText="Alegeți o metodă de plată."
    >
      <mud-radio value="card" label="Card bancar" />
      <mud-radio value="mpay" label="MPay" />
      <mud-radio value="cash" label="Numerar" />
    </mud-radio-group>
  \`,
})
export class PaymentMethodField {
  readonly method = new FormControl<string | null>(null, { validators: [Validators.required] });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [RadioReactiveDemo] })],
  render: () => ({ template: `<mud-radio-reactive-demo />` }),
};

/** Standalone two-way binding with non-string values. */
@Component({
  selector: 'mud-radio-model-demo',
  imports: [MudRadioGroup, MudRadio],
  template: `
    <div style="${COL}">
      <mud-radio-group label="Numărul de copii ai cererii" [(value)]="copies">
        <mud-radio [value]="1" label="Un exemplar" />
        <mud-radio [value]="2" label="Două exemplare" />
        <mud-radio [value]="5" label="Cinci exemplare" supportingText="Taxă suplimentară." />
      </mud-radio-group>
      <code>copies: {{ copies() ?? '—' }} (number)</code>
    </div>
  `,
})
class RadioModelDemo {
  readonly copies = signal<number | undefined>(undefined);
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const NON_STRING_VALUES_SOURCE = `
@Component({
  imports: [MudRadioGroup, MudRadio],
  template: \`
    <mud-radio-group label="Numărul de exemplare" [(value)]="copies">
      <mud-radio [value]="1" label="Un exemplar" />
      <mud-radio [value]="2" label="Două exemplare" />
      <mud-radio [value]="5" label="Cinci exemplare" supportingText="Taxă suplimentară." />
    </mud-radio-group>
  \`,
})
export class CopiesChoice {
  // Values keep their type. The group compares them with Object.is, so object
  // values must be the same reference, not a rebuilt equivalent.
  readonly copies = signal<number | undefined>(undefined);
}
`;

export const NonStringValues: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: NON_STRING_VALUES_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [RadioModelDemo] })],
  render: () => ({ template: `<mud-radio-model-demo />` }),
};
