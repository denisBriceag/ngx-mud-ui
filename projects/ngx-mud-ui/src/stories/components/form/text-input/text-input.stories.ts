import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTextInput } from 'ngx-mud-ui/text-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudIconComponent, provideMudIcons, search, envelope } from 'ngx-mud-ui/icons';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px';

const meta: Meta<MudTextInput> = {
  title: 'Components/Form/Text input',
  component: MudTextInput,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([search, envelope])] }),
    moduleMetadata({ imports: [MudTextInput, MudIconComponent, MudLabel, MudInlineMessage] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'url', 'search'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    type: 'text',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    loading: false,
    clearable: false,
    placeholder: 'De ex. 2000000000000',
  },
};

export default meta;

type Story = StoryObj<MudTextInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-text-input
          [variant]="variant"
          [size]="size"
          [type]="type"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [loading]="loading"
          [clearable]="clearable"
          [placeholder]="placeholder"
        >
          <mud-label>IDNP</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Numărul personal de identificare, 13 cifre.</mud-inline-message>
          }
        </mud-text-input>
      </div>
    `,
  }),
};

/** `invalid` forces destructive visuals; warning/success color the border and helper icon. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-text-input placeholder="Text">
          <mud-label>Default</mud-label>
          <mud-inline-message hideIcon>Helper text.</mud-inline-message>
        </mud-text-input>
        <mud-text-input variant="warning" value="M-2024">
          <mud-label>Warning</mud-label>
          <mud-inline-message variant="warning">Verificați valoarea.</mud-inline-message>
        </mud-text-input>
        <mud-text-input variant="success" value="2000000000000">
          <mud-label>Success</mud-label>
          <mud-inline-message variant="success">Valoare confirmată.</mud-inline-message>
        </mud-text-input>
        <mud-text-input invalid value="12345">
          <mud-label>Error</mud-label>
          <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
        </mud-text-input>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-text-input placeholder="14/20 text">
          <mud-label>Medium (40px)</mud-label>
        </mud-text-input>
        <mud-text-input size="large" placeholder="16/24 text">
          <mud-label>Large (48px)</mud-label>
        </mud-text-input>
      </div>
    `,
  }),
};

/** Disabled, read-only, and loading (uninteractive with a trailing spinner). */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-text-input disabled value="Nu poate fi editat">
          <mud-label>Disabled</mud-label>
        </mud-text-input>
        <mud-text-input readonly value="Doar citire, selectabil">
          <mud-label>Read-only</mud-label>
        </mud-text-input>
        <mud-text-input loading value="Se verifică...">
          <mud-label>Loading</mud-label>
        </mud-text-input>
      </div>
    `,
  }),
};

/** Icons project via the icon-start / icon-end attributes; clear (×) shows while non-empty. */
export const IconsAndClear: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-text-input type="search" clearable value="pașaport">
          <mud-label>Căutare</mud-label>
          <mud-icon icon-start name="search" [scale]="20" />
        </mud-text-input>
        <mud-text-input type="email" placeholder="nume@exemplu.md">
          <mud-label>Email</mud-label>
          <mud-icon icon-end name="envelope" [scale]="20" />
        </mud-text-input>
      </div>
    `,
  }),
};

/** Classic reactive forms via ControlValueAccessor. */
@Component({
  selector: 'mud-text-input-reactive-demo',
  imports: [MudTextInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-text-input required [formControl]="idnp" [invalid]="idnp.touched && idnp.invalid" [maxLength]="13">
        <mud-label>IDNP</mud-label>
        @if (idnp.touched && idnp.invalid) {
          <mud-inline-message variant="error">IDNP-ul trebuie să conțină 13 cifre.</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>13 cifre.</mud-inline-message>
        }
      </mud-text-input>
      <code>value: {{ idnp.value }} | touched: {{ idnp.touched }} | valid: {{ idnp.valid }}</code>
    </div>
  `,
})
class InputReactiveDemo {
  readonly idnp = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{13}$/)],
  });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudTextInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-text-input required [formControl]="idnp" [invalid]="idnp.touched && idnp.invalid" [maxLength]="13">
      <mud-label>IDNP</mud-label>
      @if (idnp.touched && idnp.invalid) {
        <mud-inline-message variant="error">IDNP-ul trebuie să conțină 13 cifre.</mud-inline-message>
      } @else {
        <mud-inline-message hideIcon>13 cifre.</mud-inline-message>
      }
    </mud-text-input>
  \`,
})
export class IdnpField {
  readonly idnp = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\\d{13}$/)],
  });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [InputReactiveDemo] })],
  render: () => ({ template: `<mud-text-input-reactive-demo />` }),
};

/**
 * Signal forms via the FormValueControl contract: [formField] binds value,
 * required, and invalid automatically (invalid is signal forms' RAW state —
 * true immediately for an empty required field). The projected message is
 * still consumer-timed: the @if below only shows it once touched.
 */
@Component({
  selector: 'mud-text-input-signal-demo',
  imports: [MudTextInput, MudLabel, MudInlineMessage, FormField, JsonPipe],
  template: `
    <div style="${COL}">
      <mud-text-input [formField]="form.name">
        <mud-label>Nume complet</mud-label>
        @if (form.name().touched() && form.name().invalid()) {
          <mud-inline-message variant="error">Numele este obligatoriu.</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>Prenume și nume.</mud-inline-message>
        }
      </mud-text-input>
      <code>model: {{ model() | json }} | touched: {{ form.name().touched() }}</code>
    </div>
  `,
})
class InputSignalDemo {
  readonly model = signal({ name: '' });
  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Numele este obligatoriu.' });
  });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const SIGNAL_FORMS_SOURCE = `
@Component({
  imports: [MudTextInput, MudLabel, MudInlineMessage, FormField],
  template: \`
    <mud-text-input [formField]="form.name">
      <mud-label>Nume complet</mud-label>
      @if (form.name().touched() && form.name().invalid()) {
        <mud-inline-message variant="error">Numele este obligatoriu.</mud-inline-message>
      } @else {
        <mud-inline-message hideIcon>Prenume și nume.</mud-inline-message>
      }
    </mud-text-input>
  \`,
})
export class NameField {
  readonly model = signal({ name: '' });

  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Numele este obligatoriu.' });
  });
}
`;

export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SIGNAL_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [InputSignalDemo] })],
  render: () => ({ template: `<mud-text-input-signal-demo />` }),
};

/** Any number of consumer-timed messages, and a rich label, can be projected. */
export const Composable: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [MudLabel, MudInlineMessage] })],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-text-input invalid value="12345">
          <mud-label>IDNP <em>(actul de identitate)</em></mud-label>
          <mud-inline-message variant="error">IDNP invalid — verificați cele 13 cifre.</mud-inline-message>
          <mud-inline-message hideIcon>Numărul de 13 cifre de pe verso.</mud-inline-message>
        </mud-text-input>

        <mud-text-input value="2000000000000">
          <mud-label>Același câmp, valid</mud-label>
          <mud-inline-message hideIcon>Helperul revine când nu mai există eroare.</mud-inline-message>
        </mud-text-input>
      </div>
    `,
  }),
};
