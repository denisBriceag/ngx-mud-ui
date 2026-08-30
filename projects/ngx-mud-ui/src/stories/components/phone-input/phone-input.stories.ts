import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MUD_PHONE_COUNTRIES, MudPhoneInput } from 'ngx-mud-ui/phone-input';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

type PhoneInputArgs = MudPhoneInput & { 'aria-label'?: string };

const meta: Meta<PhoneInputArgs> = {
  title: 'Components/Phone input',
  component: MudPhoneInput,
  decorators: [moduleMetadata({ imports: [MudPhoneInput] })],
  args: {
    label: 'Telefon',
    country: 'MD',
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    clearable: true,
    helperText: 'Numărul se folosește pentru notificări SMS.',
  },
};

export default meta;

type Story = StoryObj<PhoneInputArgs>;

/**
 * The placeholder defaults to the country's mask, and separators appear as you
 * reach them. Editing mid-number keeps the caret where you are typing.
 */
export const Playground: Story = {
  // Destructure the actual arg key, not `ariaLabel`, and pass it under a
  // non-colliding prop name. A raw `ariaLabel` prop (or the aliased key left
  // in `...args`) crashes the Storybook wrapper.
  render: ({ 'aria-label': ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${COL}">
        <mud-phone-input
          [label]="label"
          [country]="country"
          [size]="size"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [clearable]="clearable"
          [helperText]="helperText"
          [errorText]="errorText"
          [placeholder]="placeholder"
          [aria-label]="ariaLabelText"
        />
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
          <mud-phone-input [label]="c.name" [country]="c.iso" [helperText]="'Format: ' + c.mask" />
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
        <mud-phone-input
          label="Telefon (internațional)"
          mode="international"
          clearable
          value="+37362123456"
          helperText="Alegeți țara din listă."
        />
        <mud-phone-input
          label="Listă restrânsă"
          mode="international"
          [countries]="['MD','RO','IT','ES','PT']"
          helperText="Doar țările cu diaspora cea mai numeroasă."
        />
        <mud-phone-input label="Dezactivat" mode="international" disabled value="+37362123456" />
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
        <mud-phone-input
          label="Listă extinsă"
          mode="international"
          clearable
          [countries]="extended"
          helperText="Polonia și Cehia nu sunt în lista oficială — sunt adăugate din aplicație."
        />
        <mud-phone-input
          label="Țară adăugată, preselectată"
          mode="international"
          country="PL"
          [countries]="extended"
          helperText="Se formatează cu masca proprie (XXX XXX XXX)."
        />
      </div>
    `,
  }),
};

export const Locales: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input label="English (en)" mode="international" locale="en" country="DE" />
        <mud-phone-input label="Română (ro)" mode="international" locale="ro" country="DE" />
        <mud-phone-input label="Русский (ru)" mode="international" locale="ru" country="DE" />
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input label="Implicit" helperText="Introduceți numărul." />
        <mud-phone-input label="Completat" value="+37362123456" clearable />
        <mud-phone-input label="Obligatoriu, invalid" required invalid errorText="Numărul de telefon este incomplet." />
        <mud-phone-input label="Doar citire" value="+37362123456" readonly />
        <mud-phone-input label="Dezactivat" value="+37362123456" disabled />
        <mud-phone-input label="Mare (large)" size="large" value="+37362123456" clearable />
      </div>
    `,
  }),
};

/**
 * Rich content via the shared slots: `[mudLabel]`, `[mudHelper]` and
 * `[mudError]` from `ngx-mud-ui/input`.
 */
export const ComposedContent: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    moduleMetadata({
      imports: [MudPhoneInput, MudInputLabel, MudInputHelper, MudInputError, MudInlineMessage],
    }),
  ],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-phone-input>
          <span mudLabel>Telefon <strong>(mobil)</strong></span>
          <span mudHelper>Folosit doar pentru <a href="#" (click)="$event.preventDefault()">notificări MNotify</a>.</span>
        </mud-phone-input>
        <mud-phone-input invalid required>
          <span mudLabel>Telefon de contact</span>
          <mud-inline-message mudError variant="error" size="small" hideIcon>
            Numărul nu a putut fi verificat.
          </mud-inline-message>
        </mud-phone-input>
      </div>
    `,
  }),
};

@Component({
  selector: 'mud-phone-reactive-demo',
  imports: [MudPhoneInput, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-phone-input
        label="Telefon"
        required
        clearable
        [formControl]="phone"
        [invalid]="phone.touched && phone.invalid"
        errorText="Introduceți un număr moldovenesc complet (8 cifre)."
        helperText="Format: XXX XX XXX"
        (changed)="complete = $event.complete"
      />
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
  imports: [MudPhoneInput, ReactiveFormsModule],
  template: \`
    <mud-phone-input
      label="Telefon"
      required
      clearable
      [formControl]="phone"
      [invalid]="phone.touched && phone.invalid"
      errorText="Introduceți un număr moldovenesc complet (8 cifre)."
      (changed)="complete = $event.complete"
    />
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
  imports: [MudPhoneInput, FormField],
  template: `
    <div style="${COL}">
      <mud-phone-input label="Telefon" clearable [formField]="form.phone" helperText="Format: XXX XX XXX" />
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
  imports: [MudPhoneInput, FormField],
  template: \`<mud-phone-input label="Telefon" clearable [formField]="form.phone" />\`,
})
export class PhoneField {
  readonly model = signal({ phone: '' });

  // Signal forms bind \`required\`, \`invalid\` and \`errors\` for you. The field
  // value is the E.164 string, so \`required\` alone is enough here — unlike an
  // array field, an empty string is what required already tests for.
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
