import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:32px;max-width:420px;padding:24px';

const meta: Meta<MudRadioGroup> = {
  title: 'Components/Radio',
  component: MudRadioGroup,
  decorators: [moduleMetadata({ imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
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
        >
          <mud-label>Metoda de plată</mud-label>
          <mud-radio value="card">
            <mud-label>Card bancar</mud-label>
            <mud-inline-message hideIcon>Visa, Mastercard.</mud-inline-message>
          </mud-radio>
          <mud-radio value="mpay">
            <mud-label>MPay</mud-label>
            <mud-inline-message hideIcon>Fără comision.</mud-inline-message>
          </mud-radio>
          <mud-radio value="cash">
            <mud-label>Numerar la ghișeu</mud-label>
          </mud-radio>
          @if (invalid) {
            <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
          }
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
        <mud-radio-group value="mpay">
          <mud-label>Selectat</mud-label>
          <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
          <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
        </mud-radio-group>
        <mud-radio-group invalid required>
          <mud-label>Eroare</mud-label>
          <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
          <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
          <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
        </mud-radio-group>
        <mud-radio-group value="card">
          <mud-label>Cu opțiune dezactivată</mud-label>
          <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
          <mud-radio value="cash" disabled><mud-label>Numerar</mud-label></mud-radio>
        </mud-radio-group>
        <mud-radio-group value="card" disabled>
          <mud-label>Grup dezactivat</mud-label>
          <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
          <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
        </mud-radio-group>
        <mud-radio-group size="small" value="mpay">
          <mud-label>Mic (small)</mud-label>
          <mud-radio value="card">
            <mud-label>Card bancar</mud-label>
            <mud-inline-message hideIcon>14/20 + dot 10px.</mud-inline-message>
          </mud-radio>
          <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
        </mud-radio-group>
      </div>
    `,
  }),
};

/** The group is the form control: reactive forms bind on mud-radio-group. */
@Component({
  selector: 'mud-radio-reactive-demo',
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-radio-group required [formControl]="method" [invalid]="method.touched && method.invalid">
        <mud-label>Metoda de plată</mud-label>
        <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
        <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
        <mud-radio value="cash"><mud-label>Numerar</mud-label></mud-radio>
        @if (method.touched && method.invalid) {
          <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
        }
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
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-radio-group required [formControl]="method" [invalid]="method.touched && method.invalid">
      <mud-label>Metoda de plată</mud-label>
      <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
      <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
      <mud-radio value="cash"><mud-label>Numerar</mud-label></mud-radio>
      @if (method.touched && method.invalid) {
        <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
      }
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
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: `
    <div style="${COL}">
      <mud-radio-group [(value)]="copies">
        <mud-label>Numărul de copii ai cererii</mud-label>
        <mud-radio [value]="1"><mud-label>Un exemplar</mud-label></mud-radio>
        <mud-radio [value]="2"><mud-label>Două exemplare</mud-label></mud-radio>
        <mud-radio [value]="5">
          <mud-label>Cinci exemplare</mud-label>
          <mud-inline-message hideIcon>Taxă suplimentară.</mud-inline-message>
        </mud-radio>
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
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: \`
    <mud-radio-group [(value)]="copies">
      <mud-label>Numărul de exemplare</mud-label>
      <mud-radio [value]="1"><mud-label>Un exemplar</mud-label></mud-radio>
      <mud-radio [value]="2"><mud-label>Două exemplare</mud-label></mud-radio>
      <mud-radio [value]="5">
        <mud-label>Cinci exemplare</mud-label>
        <mud-inline-message hideIcon>Taxă suplimentară.</mud-inline-message>
      </mud-radio>
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
