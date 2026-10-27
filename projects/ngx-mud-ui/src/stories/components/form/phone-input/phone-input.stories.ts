import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MUD_PHONE_COUNTRIES, MudPhoneInput } from 'ngx-mud-ui/phone-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

const meta: Meta<MudPhoneInput> = {
  title: 'Components/Form/Phone input',
  component: MudPhoneInput,
  decorators: [moduleMetadata({ imports: [MudPhoneInput, MudLabel, MudInlineMessage] })],
  args: {
    country: 'MD',
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    loading: false,
    invalid: false,
    clearable: true,
  },
};

export default meta;

type Story = StoryObj<MudPhoneInput>;

/**
 * The placeholder defaults to the country's mask, and separators appear as you
 * reach them. Editing mid-number keeps the caret where you are typing.
 */
export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-phone-input
          [country]="country"
          [size]="size"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [loading]="loading"
          [invalid]="invalid"
          [clearable]="clearable"
          [placeholder]="placeholder"
        >
          <mud-label>Telefon</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Numărul de telefon este incomplet.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Numărul se folosește pentru notificări SMS.</mud-inline-message>
          }
        </mud-phone-input>
      </div>
    `,
  }),
};

/**
 * Each country brings its own dial code, mask and digit window. Set `country`
 * to pick one; the value is always canonical E.164 regardless.
 */
export const Countries: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { countries: MUD_PHONE_COUNTRIES.slice(0, 6) },
    template: `
      <div style="${COL}">
        @for (c of countries; track c.iso) {
          <mud-phone-input [country]="c.iso">
            <mud-label>{{ c.name }}</mud-label>
            <mud-inline-message hideIcon>{{ 'Format: ' + c.mask }}</mud-inline-message>
          </mud-phone-input>
        }
      </div>
    `,
  }),
};

export const International: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input mode="international" clearable value="+37362123456">
          <mud-label>Telefon (internațional)</mud-label>
          <mud-inline-message hideIcon>Alegeți țara din listă.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input mode="international" [countries]="['MD','RO','IT','ES','PT']">
          <mud-label>Listă restrânsă</mud-label>
          <mud-inline-message hideIcon>Doar țările cu diaspora cea mai numeroasă.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input mode="international" disabled value="+37362123456">
          <mud-label>Dezactivat</mud-label>
        </mud-phone-input>
        <mud-phone-input mode="international" readonly value="+37362123456">
          <mud-label>Doar citire</mud-label>
        </mud-phone-input>
      </div>
    `,
  }),
};

export const CustomCountries: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      extended: [
        'MD',
        'RO',
        {
          iso: 'PL',
          dialCode: '+48',
          name: 'Poland',
          mask: 'XXX XXX XXX',
          minDigits: 9,
          maxDigits: 9,
        },
        {
          iso: 'CZ',
          dialCode: '+420',
          name: 'Czechia',
          mask: 'XXX XXX XXX',
          minDigits: 9,
          maxDigits: 9,
        },
      ],
    },
    template: `
      <div style="${COL}">
        <mud-phone-input mode="international" clearable [countries]="extended">
          <mud-label>Listă extinsă</mud-label>
          <mud-inline-message hideIcon>Polonia și Cehia nu sunt în lista oficială — sunt adăugate din aplicație.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input mode="international" country="PL" [countries]="extended">
          <mud-label>Țară adăugată, preselectată</mud-label>
          <mud-inline-message hideIcon>Se formatează cu masca proprie (XXX XXX XXX).</mud-inline-message>
        </mud-phone-input>
      </div>
    `,
  }),
};

export const Locales: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input mode="international" locale="en" country="DE">
          <mud-label>English (en)</mud-label>
        </mud-phone-input>
        <mud-phone-input mode="international" locale="ro" country="DE">
          <mud-label>Română (ro)</mud-label>
        </mud-phone-input>
        <mud-phone-input mode="international" locale="ru" country="DE">
          <mud-label>Русский (ru)</mud-label>
        </mud-phone-input>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input>
          <mud-label>Implicit</mud-label>
          <mud-inline-message hideIcon>Introduceți numărul.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input value="+37362123456" clearable>
          <mud-label>Completat</mud-label>
        </mud-phone-input>
        <mud-phone-input required invalid>
          <mud-label>Obligatoriu, invalid</mud-label>
          <mud-inline-message variant="error">Numărul de telefon este incomplet.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input value="+37362123456" readonly>
          <mud-label>Doar citire</mud-label>
        </mud-phone-input>
        <mud-phone-input value="+37362123456" disabled>
          <mud-label>Dezactivat</mud-label>
        </mud-phone-input>
        <mud-phone-input value="+37362123456" loading>
          <mud-label>Se încarcă</mud-label>
        </mud-phone-input>
        <mud-phone-input size="large" value="+37362123456" clearable>
          <mud-label>Mare (large)</mud-label>
        </mud-phone-input>
      </div>
    `,
  }),
};

/** Any number of consumer-timed messages, and a rich label, can be projected. */
export const ComposedContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input>
          <mud-label>Telefon <strong>(mobil)</strong></mud-label>
          <mud-inline-message hideIcon>Folosit doar pentru <a href="#" (click)="$event.preventDefault()">notificări MNotify</a>.</mud-inline-message>
        </mud-phone-input>
        <mud-phone-input invalid required>
          <mud-label>Telefon de contact</mud-label>
          <mud-inline-message variant="error" hideIcon>Numărul nu a putut fi verificat.</mud-inline-message>
        </mud-phone-input>
      </div>
    `,
  }),
};

@Component({
  selector: 'mud-phone-reactive-demo',
  imports: [MudPhoneInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-phone-input required clearable [formControl]="phone" [invalid]="phone.touched && phone.invalid" (changed)="complete = $event.complete">
        <mud-label>Telefon</mud-label>
        @if (phone.touched && phone.invalid) {
          <mud-inline-message variant="error">Introduceți un număr moldovenesc complet (8 cifre).</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>Format: XXX XX XXX</mud-inline-message>
        }
      </mud-phone-input>
      <code>value: {{ phone.value || '—' }} | valid: {{ phone.valid }} | complete: {{ complete }}</code>
    </div>
  `,
})
class PhoneReactiveDemo {
  complete = false;
  readonly phone = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\+373\d{8}$/)],
  });
}

const REACTIVE_SOURCE = `
@Component({
  imports: [MudPhoneInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-phone-input
      required
      clearable
      [formControl]="phone"
      [invalid]="phone.touched && phone.invalid"
      (changed)="complete = $event.complete"
    >
      <mud-label>Telefon</mud-label>
      @if (phone.touched && phone.invalid) {
        <mud-inline-message variant="error">Introduceți un număr moldovenesc complet (8 cifre).</mud-inline-message>
      }
    </mud-phone-input>
  \`,
})
export class PhoneField {
  complete = false;

  // The value is canonical E.164, so a pattern validator has a stable shape
  // to match. \`changed.complete\` reports the country's own digit window.
  readonly phone = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\\+373\\d{8}$/)],
  });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [PhoneReactiveDemo] })],
  render: () => ({ template: `<mud-phone-reactive-demo />` }),
};

@Component({
  selector: 'mud-phone-signal-demo',
  imports: [MudPhoneInput, MudLabel, MudInlineMessage, FormField],
  template: `
    <div style="${COL}">
      <mud-phone-input clearable [formField]="form.phone">
        <mud-label>Telefon</mud-label>
        @if (form.phone().touched() && form.phone().invalid()) {
          <mud-inline-message variant="error">Numărul de telefon este obligatoriu.</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>Format: XXX XX XXX</mud-inline-message>
        }
      </mud-phone-input>
      <code>model: {{ model().phone || '—' }} | touched: {{ form.phone().touched() }}</code>
    </div>
  `,
})
class PhoneSignalDemo {
  readonly model = signal({ phone: '' });
  readonly form = form(this.model, (path) => {
    required(path.phone, { message: 'Numărul de telefon este obligatoriu.' });
  });
}

const SIGNAL_SOURCE = `
@Component({
  imports: [MudPhoneInput, MudLabel, MudInlineMessage, FormField],
  template: \`
    <mud-phone-input clearable [formField]="form.phone">
      <mud-label>Telefon</mud-label>
      @if (form.phone().touched() && form.phone().invalid()) {
        <mud-inline-message variant="error">Numărul de telefon este obligatoriu.</mud-inline-message>
      }
    </mud-phone-input>
  \`,
})
export class PhoneField {
  readonly model = signal({ phone: '' });

  // Signal forms bind \`required\` and \`invalid\` for you. The field value is
  // the E.164 string, so \`required\` alone is enough here — unlike an array
  // field, an empty string is what required already tests for.
  readonly form = form(this.model, (path) => {
    required(path.phone, { message: 'Numărul de telefon este obligatoriu.' });
  });
}
`;

export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SIGNAL_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [PhoneSignalDemo] })],
  render: () => ({ template: `<mud-phone-signal-demo />` }),
};
